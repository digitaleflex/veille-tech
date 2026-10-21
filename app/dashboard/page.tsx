"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import StatsWidget from '@/components/dashboard/StatsWidget';
import QuickActionsWidget from '@/components/dashboard/QuickActionsWidget';
import LastReviewWidget from '@/components/dashboard/LastReviewWidget';

interface DashboardStats {
  totalReviews: number;
  totalNews: number;
  avgGenerationTime: number;
  categoryDistribution: Record<string, number>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/stats', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Impossible de charger les statistiques');
        return response.json();
      })
      .then((data: DashboardStats) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const topCategory = useMemo(() => {
    if (!stats) return null;
    const entry = Object.entries(stats.categoryDistribution)
      .sort((a, b) => b[1] - a[1])[0];
    return entry?.[0] ?? null;
  }, [stats]);

  const dashboardStats = stats
    ? { totalReviews: stats.totalReviews, topCategory: topCategory ?? '—' }
    : null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <div className="lg:col-span-2">
        <StatsWidget stats={dashboardStats} variants={itemVariants} />
      </div>
      <QuickActionsWidget variants={itemVariants} />
      <LastReviewWidget lastReview={null} variants={itemVariants} />
    </motion.div>
  );
}
