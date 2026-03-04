import React, { useState } from 'react';
import { X, Plus, FolderPlus, Loader2 } from 'lucide-react';
import { folderService } from '../services/api';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [folderName, setFolderName] = useState('');
    const [limitMB, setLimitMB] = useState(1024);
    const [share, setShare] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await folderService.createFolder({
                name,
                path: `/srv/samba/${folderName.replace(/^\/+|\/+$/g, '')}`,
                limitMB: Number(limitMB),
                share
            });
            onSuccess();
            onClose();
            // Reset form
            setName('');
            setFolderName('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error creating share. Check server logs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            />
            <div className="relative glass-container w-full max-w-lg p-10 animate-slide-up overflow-hidden">
                <div className="absolute top-0 right-0 p-6">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500">
                        <FolderPlus className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white leading-tight">Create New Share</h3>
                        <p className="text-sm text-slate-500 mt-1">Configure your new storage volume</p>
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Share Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (!folderName || folderName === name.toLowerCase().replace(/\s+/g, '_')) {
                                    setFolderName(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                                }
                            }}
                            placeholder="e.g. Multimedia"
                            className="w-full input-field"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Storage Path</label>
                        <div className="flex items-center gap-2 w-full input-field group-focus-within:border-blue-500/50 transition-all">
                            <span className="text-slate-500 font-mono text-sm select-none">/srv/samba/</span>
                            <input
                                type="text"
                                value={folderName}
                                onChange={(e) => setFolderName(e.target.value)}
                                className="bg-transparent border-none outline-none flex-1 p-0 text-white placeholder-slate-600 focus:ring-0"
                                placeholder="name"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Quota (MB)</label>
                            <input
                                type="number"
                                value={limitMB}
                                onChange={(e) => setLimitMB(Number(e.target.value))}
                                className="w-full input-field"
                                required
                            />
                        </div>
                        <div className="flex items-end pb-1">
                            <label className="flex items-center gap-3 cursor-pointer group w-full p-3.5 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                                <input
                                    type="checkbox"
                                    checked={share}
                                    onChange={(e) => setShare(e.target.checked)}
                                    className="w-5 h-5 rounded-lg border-white/10 bg-transparent text-blue-600 focus:ring-blue-600 focus:ring-offset-0"
                                />
                                <span className="text-sm font-semibold text-slate-400 group-hover:text-white transition-colors">Samba Init</span>
                            </label>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full premium-btn py-4"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    Initialize Share
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Modal;
