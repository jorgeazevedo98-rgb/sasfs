import React from 'react';
import { X, Mail, Save } from 'lucide-react';

interface SMTPConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SMTPConfigModal: React.FC<SMTPConfigModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 sm:p-0">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            />
            <div className="relative glass-container w-full max-w-lg p-8 animate-slide-up border-white/10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4 text-left">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">SMTP Configuration</h3>
                            <p className="text-sm text-slate-500">Service for system alert emails</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Host</label>
                            <input type="text" placeholder="smtp.example.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Port</label>
                            <input type="number" placeholder="587" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Authentication User</label>
                        <input type="email" placeholder="alerts@system.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Password</label>
                        <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm" />
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                        <button
                            type="button"
                            className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-all"
                        >
                            Test Connection
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
                        >
                            <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Save Config
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SMTPConfigModal;
