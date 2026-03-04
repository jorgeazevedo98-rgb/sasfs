import React, { useState } from 'react';
import { ChevronRight, Share2, HardDrive, Trash2, Loader2, Edit3 } from 'lucide-react';
import { folderService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatStorage, calculatePercent } from '../utils/storage';

interface Folder {
    id: number;
    name: string;
    path: string;
    limitMB: number;
    usedMB: number;
    totalMB?: number;
    share: boolean;
}

interface FolderRowProps {
    folder: Folder;
    onDelete: () => void;
    onDetails: (folder: Folder) => void;
    onEdit: (folder: Folder) => void;
}

const FolderRow: React.FC<FolderRowProps> = ({ folder, onDelete, onDetails, onEdit }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [isDeleting, setIsDeleting] = useState(false);

    const usagePercent = calculatePercent(folder.usedMB, folder.limitMB);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${folder.name}"? This will ERASE the directory from the disk.`)) return;

        setIsDeleting(true);
        try {
            await folderService.deleteFolder(folder.id);
            onDelete();
        } catch (error) {
            alert('Error deleting folder. Check console.');
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <tr className="hover:bg-white/[0.03] transition-all duration-300 group">
            <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-blue-500/10 transition-colors">
                        <HardDrive className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                    </div>
                    <div>
                        <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">{folder.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{folder.share ? 'Shared on Samba' : 'Local Only'}</div>
                    </div>
                </div>
            </td>
            <td className="px-8 py-6">
                <code className="text-xs text-slate-400 font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">{folder.path}</code>
            </td>
            <td className="px-8 py-6">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-300">
                        {formatStorage(folder.usedMB)} / {formatStorage(folder.limitMB)}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Quota Provisioned</span>
                    </div>
                </div>
            </td>
            <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-[120px] h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-orange-500' : 'bg-blue-500'
                                }`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                    </div>
                    <span className="text-xs font-bold text-slate-500 w-8">{usagePercent.toFixed(0)}%</span>
                </div>
            </td>
            <td className="px-8 py-6">
                <div className="flex items-center justify-center">
                    {folder.share ? (
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                            <Share2 className="w-4 h-4" />
                        </div>
                    ) : (
                        <div className="w-8 h-8" />
                    )}
                </div>
            </td>
            <td className="px-8 py-6 text-right">
                <div className="flex items-center justify-end gap-2">
                    {isAdmin && (
                        <>
                            <button
                                onClick={() => onEdit(folder)}
                                className="p-2.5 hover:bg-blue-500/10 rounded-xl text-slate-500 hover:text-blue-500 transition-all border border-transparent hover:border-blue-500/20"
                                title="Edit Quota"
                            >
                                <Edit3 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="p-2.5 hover:bg-red-500/10 rounded-xl text-slate-500 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                                title="Delete Share"
                            >
                                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => onDetails(folder)}
                        className="p-2.5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-all border border-transparent hover:border-white/10"
                        title="Connection Details"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default FolderRow;
