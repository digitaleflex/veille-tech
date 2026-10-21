import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/server/prisma';
import { createReviewSchema, validateRequest } from '@/lib/schemas/validation';
import { auth } from '@/auth';

// GET /api/reviews?date=...&startDate=...&endDate=...&isPublic=...
export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const isPublic = searchParams.get('isPublic');

    // Public callers may only see public reviews. Signed-in users may see
    // public reviews and their own reviews; an explicit private filter is
    // restricted to the signed-in user's own private reviews.
    const visibilityFilter = isPublic === 'true'
        ? { isPublic: true }
        : isPublic === 'false'
            ? (userId ? { isPublic: false, userId } : null)
            : (userId
                ? { OR: [{ isPublic: true }, { userId }] }
                : { isPublic: true });

    if (!visibilityFilter) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        if (date) {
            const review = await prisma.review.findFirst({
                where: { date, ...visibilityFilter },
                include: {
                    ReviewToTag: { include: { tags: true } },
                    sources: true,
                    user: { select: { id: true, username: true } },
                },
            });
            return NextResponse.json(review || null);
        }

        const dateFilter = startDate && endDate
            ? { date: { gte: startDate, lte: endDate } }
            : {};

        const reviews = await prisma.review.findMany({
            where: { ...dateFilter, ...visibilityFilter },
            include: {
                ReviewToTag: { include: { tags: true } },
                sources: true,
            },
            orderBy: { date: 'desc' },
        });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/reviews
export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const {
            content, sources, date, formattedDate, flashSummary, aiAnalysis,
            dominantCategory, newsCount, generationTime, isPublic, tags: tagNames, id
        } = validateRequest(createReviewSchema, body.review);

        const tagOperations = (tagNames || []).map(async (tagName: string) =>
            prisma.tag.upsert({
                where: { name: tagName },
                update: {},
                create: { name: tagName },
            })
        );
        const tags = await Promise.all(tagOperations);

        const newReview = await prisma.review.create({
            data: {
                id: id || Math.random().toString(36).substring(2, 15),
                date, formattedDate, content, flashSummary, aiAnalysis,
                dominantCategory, newsCount, generationTime, isPublic,
                userId,
                ReviewToTag: {
                    create: tags.map((tag: { id: string }) => ({
                        tags: { connect: { id: tag.id } },
                    })),
                },
                sources: {
                    create: (sources || []).map((source: { title: string; uri: string }) => ({
                        title: source.title,
                        uri: source.uri,
                    })),
                },
            },
            include: { ReviewToTag: { include: { tags: true } }, sources: true },
        });

        return NextResponse.json(newReview, { status: 201 });
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'ZodError') {
            return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
        }
        console.error('Error creating review:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
