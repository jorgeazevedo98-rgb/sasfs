import React, { useState, useEffect } from 'react';
import { X, Save, HardDrive, Loader2, AlertCircle, Plus } from 'lucide-react';
import { folderService } from '../services/api';

interface Folder {
    id: number;
    name: string;
    path: string;
    limitMB: number;
    usedMB: number;
}

interface EditQuotaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    folder: Folder | null;
}

const EditQuotaModal: React.FC<EditQuotaModalProps> = ({ isOpen, onClose, onSuccess, folder }) => {
    const [increment, setIncrement] = useState<string>('1024');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (folder) {
            setIncrement('1024');
            setError(null);
        }
    }, [folder]);

    if (!isOpen || !folder) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const incNum = parseInt(increment);
        if (isNaN(incNum) || incNum <= 0) {
            setError('Please enter a valid positive increment');
            return;
        }

        setIsLoading(true);
        try {
            // Send the increment to the backend
            await folderService.updateFolder(folder.id, { incrementMB: incNum });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error updating quota');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const newTotal = folder.limitMB + (parseInt(increment) || 0);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 sm:p-0">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            />
            <div className="relative glass-container w-full max-w-md p-8 animate-slide-up border-white/10 text-center">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4 text-left">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                            <Plus className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Increment Storage</h3>
                            <p className="text-sm text-slate-500">Add space to "{folder.name}"</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Limit</div>
                        <div className="text-xl font-bold text-white">{folder.limitMB} MB</div>
                    </div>
                    <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                        <div className="text-[10px] font-black text-blue-500/70 uppercase tracking-widest mb-1">New Total</div>
                        <div className="text-xl font-bold text-blue-400">{newTotal} MB</div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2 text-left">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                            Add Amount (MB)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                required
                                value={increment}
                                onChange={(e) => setIncrement(e.target.value)}
                                placeholder="e.g. 1024"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-center text-2xl font-bold focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm animate-shake text-left">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Confirm Expansion
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditQuotaModal;
