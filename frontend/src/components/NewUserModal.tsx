import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, Shield, Key } from 'lucide-react';
import { userService } from '../services/api';

interface NewUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const NewUserModal: React.FC<NewUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'admin' | 'user'>('user');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await userService.createUser({ username, password, role });
            onSuccess();
            onClose();
            setUsername('');
            setPassword('');
            setRole('user');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error creating user');
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
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                            <UserPlus className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">New Platform User</h2>
                            <p className="text-slate-500 text-sm font-medium">Add administrative access</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Username</label>
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm text-white placeholder-slate-600"
                                    placeholder="Enter username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
                            <div className="relative group">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm text-white placeholder-slate-600"
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Account Role</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('user')}
                                    className={`py-3 rounded-xl border transition-all text-xs font-bold ${role === 'user'
                                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-500'
                                        : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
                                        }`}
                                >
                                    Standard User
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('admin')}
                                    className={`py-3 rounded-xl border transition-all text-xs font-bold ${role === 'admin'
                                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500'
                                        : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
                                        }`}
                                >
                                    Administrator
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full premium-btn py-4 justify-center mt-4"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    <span>Create Account</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default NewUserModal;
