import React from 'react';
import { AlertCircle, AlertTriangle, Info, Clock, ChevronRight } from 'lucide-react';

export interface Alert {
    id: string;
    type: 'warning' | 'critical' | 'info';
    title: string;
    message: string;
    folderId?: number;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
}

interface AlertItemProps {
    alert: Alert;
    onAction: (folderId: number) => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, onAction }) => {
    const getIcon = () => {
        switch (alert.type) {
            case 'critical': return <AlertCircle className="w-6 h-6 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-6 h-6 text-orange-500" />;
            default: return <Info className="w-6 h-6 text-blue-500" />;
        }
    };

    const getBgColor = () => {
        switch (alert.type) {
            case 'critical': return 'bg-red-500/10 border-red-500/20';
            case 'warning': return 'bg-orange-500/10 border-orange-500/20';
            default: return 'bg-blue-500/10 border-blue-500/20';
        }
    };

    const getTimeAgo = (timestamp: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    return (
        <div className={`p-6 rounded-2xl border ${getBgColor()} flex items-start gap-6 group transition-all hover:scale-[1.01] animate-fade-in`}>
            <div className={`p-4 rounded-xl bg-white/5 border border-white/5 ${alert.type === 'critical' ? 'animate-pulse' : ''}`}>
                {getIcon()}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="text-lg font-bold text-white leading-none">{alert.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(alert.timestamp)}
                    </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    {alert.message}
                </p>

                {alert.folderId && (
                    <button
                        onClick={() => onAction(alert.folderId!)}
                        className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider"
                    >
                        Expand Quota Now
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
            </div>

            <div className={`w-1 self-stretch rounded-full ${alert.severity === 'high' ? 'bg-red-500' :
                    alert.severity === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
                }`} />
        </div>
    );
};

export default AlertItem;
