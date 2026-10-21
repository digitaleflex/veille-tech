import { prisma } from '@/lib/server/prisma';
import { Prisma } from '@prisma/client';

export interface SearchReviewsParams {
    q?: string;
    category?: string;
    tags?: string[];
    dateFrom?: string;
    dateTo?: string;
    viewerUserId?: string;
}

export async function searchReviews(params: SearchReviewsParams) {
    const { q, category, tags, dateFrom, dateTo, viewerUserId } = params;
    const tagList = tags || [];

    // The viewer identity must come from the authenticated session, never
    // from a user-controlled query parameter.
    const visibilityFilter: Prisma.ReviewWhereInput = viewerUserId
        ? { OR: [{ isPublic: true }, { userId: viewerUserId }] }
        : { isPublic: true };

    const whereClause: Prisma.ReviewWhereInput = {
        AND: [
            visibilityFilter,
            q
                ? {
                    OR: [
                        { content: { contains: q, mode: 'insensitive' } },
                        { flashSummary: { contains: q, mode: 'insensitive' } },
                        { aiAnalysis: { contains: q, mode: 'insensitive' } },
                    ],
                }
                : {},
            category && category !== 'Mix' ? { dominantCategory: category } : {},
            tagList.length > 0
                ? {
                    ReviewToTag: {
                        some: {
                            tags: { name: { in: tagList } },
                        },
                    },
                }
                : {},
            dateFrom ? { date: { gte: dateFrom } } : {},
            dateTo ? { date: { lte: dateTo } } : {},
        ],
    };

    return prisma.review.findMany({
        where: whereClause,
        include: {
            ReviewToTag: { include: { tags: true } },
            sources: true,
            user: { select: { username: true } },
        },
        orderBy: { date: 'desc' },
    });
}
