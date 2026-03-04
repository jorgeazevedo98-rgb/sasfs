import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    subtextText?: string;
    icon: LucideIcon;
    iconColor: string;
    progress?: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subtextText, icon: Icon, iconColor, progress }) => {
    return (
        <div className="glass-card p-8 flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <span className="stat-label">{label}</span>
                <div className={`p-2.5 rounded-xl bg-white/5 ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>

            <div className="space-y-1">
                <div className="stat-value">{value}</div>
                {subtextText && <div className="text-sm text-slate-500 font-medium">{subtextText}</div>}
            </div>

            {progress !== undefined && (
                <div className="space-y-3 pt-2">
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${progress > 90 ? 'bg-red-500' : progress > 70 ? 'bg-orange-500' : 'bg-blue-500'
                                }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span>Utilization</span>
                        <span>{progress}%</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatCard;
