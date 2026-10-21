import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { validateRequest, searchReviewsSchema } from '@/lib/schemas/validation';
import { searchReviews } from '@/lib/services/searchService';

export async function GET(req: Request) {
    const session = await auth.api.getSession({ headers: await headers() });
    const viewerUserId = session?.user?.id;

    try {
        const { searchParams } = new URL(req.url);
        const queryParams = Object.fromEntries(searchParams.entries());
        // userId is intentionally not accepted: identity comes from the session.
        const { query: q, category, tags, dateFrom, dateTo } =
            validateRequest(searchReviewsSchema, queryParams);

        if (!q && !category && !tags && !dateFrom && !dateTo) {
            return NextResponse.json({ error: 'Critères de recherche requis' }, { status: 400 });
        }

        const results = await searchReviews({
            q,
            category,
            tags,
            dateFrom,
            dateTo,
            viewerUserId,
        });

        return NextResponse.json(results);
    } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'ZodError') {
            return NextResponse.json({ error: 'Paramètres de recherche invalides' }, { status: 400 });
        }
        console.error('Error searching reviews:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
