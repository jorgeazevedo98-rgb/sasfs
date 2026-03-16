import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, AlertTriangle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
    id: string;
    type: NotificationType;
    message: string;
}

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
}

interface NotificationContextType {
    showNotification: (type: NotificationType, message: string) => void;
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        resolve: (value: boolean) => void;
        options: ConfirmOptions;
    } | null>(null);

    const showNotification = useCallback((type: NotificationType, message: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setNotifications(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    }, []);

    const confirm = useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setConfirmState({
                isOpen: true,
                resolve,
                options
            });
        });
    }, []);

    const handleConfirmClose = (value: boolean) => {
        if (confirmState) {
            confirmState.resolve(value);
            setConfirmState(null);
        }
    };

    return (
        <NotificationContext.Provider value={{ showNotification, confirm }}>
            {children}
            
            {/* Global Toaster */}
            <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-80 pointer-events-none">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className="group pointer-events-auto animate-slide-in-right glass-container !p-4 flex items-start gap-4 border border-white/10 shadow-2xl"
                        style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                    >
                        <div className={`p-2 rounded-xl ${
                            n.type === 'success' ? 'bg-green-500/10 text-green-500' :
                            n.type === 'error' ? 'bg-red-500/10 text-red-500' :
                            n.type === 'warning' ? 'bg-orange-500/10 text-orange-500' :
                            'bg-blue-500/10 text-blue-500'
                        }`}>
                            {n.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                            {n.type === 'error' && <XCircle className="w-5 h-5" />}
                            {n.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                            {n.type === 'info' && <Info className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 pt-0.5">
                            <p className="text-sm font-semibold text-white">{n.message}</p>
                        </div>
                        <button 
                            onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))}
                            className="text-slate-500 hover:text-white transition-colors"
                        >
                            <XCircle className="w-4 h-4 opacity-50 hover:opacity-100" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Global Confirmation Modal */}
            {confirmState && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                    <div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
                        onClick={() => handleConfirmClose(false)}
                    />
                    <div className="relative glass-container w-full max-w-md p-8 animate-slide-up translate-y-6 bg-slate-900/90 border border-white/10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`p-3 rounded-2xl ${
                                confirmState.options.variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                            }`}>
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">{confirmState.options.title}</h3>
                        </div>
                        <p className="text-slate-400 mb-8 leading-relaxed">{confirmState.options.message}</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleConfirmClose(false)}
                                className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/10 font-bold transition-all"
                            >
                                {confirmState.options.cancelText || 'Cancel'}
                            </button>
                            <button
                                onClick={() => handleConfirmClose(true)}
                                className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
                                    confirmState.options.variant === 'danger' 
                                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                                }`}
                            >
                                {confirmState.options.confirmText || 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within a NotificationProvider');
    return context;
};
