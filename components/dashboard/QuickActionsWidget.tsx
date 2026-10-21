import React from 'react';
import { motion } from 'framer-motion';
import { Search, CalendarDays, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QuickActionsWidgetProps {
    variants: any;
}

const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({ variants }) => {
    const router = useRouter();

    return (
        <motion.div
            variants={variants}
            className="lg:col-span-1 bg-gradient-to-br from-primary/20 to-accent-ia/20 backdrop-blur-md border border-primary/20 p-6 rounded-3xl flex flex-col justify-between"
        >
            <div className="space-y-2">
                <h4 className="font-bold text-white text-lg">Actions rapides</h4>
                <p className="text-slate-400 text-xs">Accès direct aux fonctions disponibles.</p>
            </div>

            <div className="space-y-3 mt-6">
                <button
                    onClick={() => router.push('/search')}
                    className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all"
                >
                    <div className="flex items-center gap-3">
                        <Search className="text-blue-400 w-4 h-4" />
                        <span className="text-sm font-medium text-white">Rechercher une revue</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-500" />
                </button>
                <button
                    onClick={() => router.push('/calendar')}
                    className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all"
                >
                    <div className="flex items-center gap-3">
                        <CalendarDays className="text-emerald-400 w-4 h-4" />
                        <span className="text-sm font-medium text-white">Bibliothèque des revues</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-500" />
                </button>
            </div>
        </motion.div>
    );
};

export default QuickActionsWidget;
