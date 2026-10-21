import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { prisma } from '@/lib/server/prisma';
import cacheService from '@/lib/server/cacheService';
import logger from '@/lib/server/logger';

export async function GET() {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    try {
        // Anonymous visitors only receive aggregate statistics for public reviews.
        // Authenticated users receive statistics for their own reviews.
        const where = userId ? { userId } : { isPublic: true };
        const cacheKey = cacheService.generateKey({
            type: 'stats',
            scope: userId ? 'user' : 'public',
            userId: userId || null,
        });
        const cachedStats = cacheService.get(cacheKey);

        if (cachedStats) {
            return NextResponse.json(cachedStats);
        }

        const startTime = Date.now();
        const [totalReviews, totalNews, avgGenerationTime, categoryDistribution] =
            await Promise.all([
                prisma.review.count({ where }),
                prisma.review.aggregate({ where, _sum: { newsCount: true } }),
                prisma.review.aggregate({ where, _avg: { generationTime: true } }),
                prisma.review.groupBy({
                    by: ['dominantCategory'],
                    where,
                    _count: { dominantCategory: true },
                }),
            ]);

        const stats = {
            totalReviews,
            totalNews: totalNews._sum.newsCount || 0,
            avgGenerationTime: avgGenerationTime._avg.generationTime || 0,
            categoryDistribution: categoryDistribution.reduce(
                (acc: Record<string, number>, item) => {
                    acc[item.dominantCategory] = item._count.dominantCategory;
                    return acc;
                },
                {} as Record<string, number>,
            ),
        };

        cacheService.set(cacheKey, stats, 60);
        logger.info('Stats calculated and cached', {
            duration: `${(Date.now() - startTime) / 1000}s`,
            scope: userId ? 'user' : 'public',
        });

        return NextResponse.json(stats);
    } catch (error) {
        logger.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
