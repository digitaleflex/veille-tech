import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

interface StatsWidgetProps {
    stats: {
        totalReviews: number;
        topCategory: string;
    } | null;
    variants: any;
}

const StatsWidget: React.FC<StatsWidgetProps> = ({ stats, variants }) => (
    <motion.div
        variants={variants}
        className="bg-dark-800/40 backdrop-blur-md border border-slate-700/50 p-6 rounded-3xl relative overflow-hidden group hover:border-primary/30 transition-colors"
    >
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <BarChart3 size={20} />
            </div>
            <h3 className="font-bold text-white">Veille Pulse</h3>
        </div>

        {stats ? (
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Revues enregistrées</p>
                    <p className="text-3xl font-black text-white">{stats.totalReviews}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Catégorie principale</p>
                    <p className="text-2xl font-bold text-primary">{stats.topCategory}</p>
                </div>
            </div>
        ) : (
            <p className="text-sm leading-6 text-slate-400">
                Les statistiques réelles ne sont pas disponibles pour le moment.
            </p>
        )}

        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart3 size={120} className="text-primary rotate-12" />
        </div>
    </motion.div>
);

export default StatsWidget;
