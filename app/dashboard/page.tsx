"use client";

import React from 'react';
import { motion } from 'framer-motion';
import TrendsWidget from '@/components/dashboard/TrendsWidget';
import StatsWidget from '@/components/dashboard/StatsWidget';
import QuickActionsWidget from '@/components/dashboard/QuickActionsWidget';
import LastReviewWidget from '@/components/dashboard/LastReviewWidget';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  // Do not present fabricated metrics as real product data.
  // Wire these widgets to persisted data when the underlying queries are validated.
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatsWidget stats={null} variants={itemVariants} />
        <TrendsWidget topTrends={[]} variants={itemVariants} />
      </div>
      <QuickActionsWidget variants={itemVariants} />
      <LastReviewWidget lastReview={null} variants={itemVariants} />
    </motion.div>
  );
}
