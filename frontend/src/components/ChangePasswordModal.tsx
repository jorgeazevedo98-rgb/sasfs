import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Key, Shield, CheckCircle2 } from 'lucide-react';
import { userService } from '../services/api';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number | null;
    username: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, userId, username }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (userId) {
                await userService.changePassword(userId, password);
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    onClose();
                    setPassword('');
                    setConfirmPassword('');
                }, 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error updating password');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="glass-container w-full max-w-md max-h-[90vh] overflow-y-auto relative animate-scale-up translate-y-12">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                            <Key className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Change Password</h2>
                            <p className="text-slate-500 text-sm font-medium">Resetting access for <span className="text-indigo-400">@{username}</span></p>
                        </div>
                    </div>

                    {success ? (
                        <div className="py-10 flex flex-col items-center animate-bounce-subtle">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-white font-bold text-xl">Password Updated!</h3>
                            <p className="text-slate-500 mt-2">New credentials have been applied.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">New Password</label>
                                <div className="relative group">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm text-white placeholder-slate-600"
                                        placeholder="••••••••••••"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm text-white placeholder-slate-600"
                                        placeholder="••••••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full premium-btn py-4 justify-center mt-4 bg-indigo-500 hover:bg-indigo-600"
                                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Key className="w-5 h-5" />
                                        <span>Update Password</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ChangePasswordModal;
