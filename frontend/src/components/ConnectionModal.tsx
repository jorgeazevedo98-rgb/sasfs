import React, { useState } from 'react';
import { X, Copy, Monitor, Share2, Server, Key, Check } from 'lucide-react';

interface Folder {
    id: number;
    name: string;
    path: string;
    limitMB: number;
    usedMB: number;
    share: boolean;
    username?: string;
    password?: string;
}

interface ConnectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    folder: Folder;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({ isOpen, onClose, folder }) => {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    if (!isOpen) return null;

    const serverIP = typeof window !== 'undefined' ? window.location.hostname : "192.168.15.12";
    const smbPath = `\\\\${serverIP}\\${folder.name}`;

    const copyToClipboard = async (text: string, id: string) => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback for non-HTTPS
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.error('Fallback copy failed', err);
                }
                document.body.removeChild(textArea);
            }

            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 sm:p-0">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            />
            <div className="relative glass-container w-full max-w-xl p-8 animate-slide-up border-white/10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                            <Monitor className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Connection Details</h3>
                            <p className="text-sm text-slate-500">Access information for "{folder.name}"</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Samba / Windows Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                            <Share2 className="w-3 h-3" />
                            Samba / Windows Network
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-4 group hover:border-blue-500/30 transition-all">
                            <code className="flex-1 font-mono text-sm text-blue-400 truncate">{smbPath}</code>
                            <button
                                onClick={() => copyToClipboard(smbPath, 'smb')}
                                className={`p-2 rounded-lg transition-all ${copiedId === 'smb'
                                    ? 'bg-green-500/20 text-green-500'
                                    : 'hover:bg-white/10 text-slate-500 hover:text-white'
                                    }`}
                                title="Copy to clipboard"
                            >
                                {copiedId === 'smb' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* FTP Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                            <Server className="w-3 h-3" />
                            FTP Access
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-4 group hover:border-blue-500/30 transition-all">
                            <a
                                href={folder.username ? `ftp://${folder.username}@${serverIP}:21` : `ftp://${serverIP}:21`}
                                className="flex-1 font-mono text-sm text-blue-400 hover:text-blue-300 hover:underline truncate transition-colors"
                            >
                                {folder.username ? `ftp://${folder.username}@${serverIP}:21` : `ftp://${serverIP}:21`}
                            </a>
                            <button
                                onClick={() => copyToClipboard(folder.username ? `ftp://${folder.username}@${serverIP}:21` : `ftp://${serverIP}:21`, 'ftp')}
                                className={`p-2 rounded-lg transition-all ${copiedId === 'ftp'
                                    ? 'bg-green-500/20 text-green-500'
                                    : 'hover:bg-white/10 text-slate-500 hover:text-white'
                                    }`}
                                title="Copy FTP Link"
                            >
                                {copiedId === 'ftp' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-500 px-1 italic">
                            Tip: Link pre-filled with username. Click to open.
                        </p>
                    </div>

                    {/* Credentials Info */}
                    {(folder.username && folder.password) ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                                <Key className="w-3 h-3" />
                                Login Credentials
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-4 group hover:border-blue-500/30 transition-all">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Username</div>
                                        <code className="font-mono text-sm text-blue-400 truncate block">{folder.username}</code>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(folder.username!, 'user')}
                                        className={`p-2 rounded-lg transition-all ${copiedId === 'user' ? 'bg-green-500/20 text-green-500' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        {copiedId === 'user' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-4 group hover:border-blue-500/30 transition-all">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Password</div>
                                        <code className="font-mono text-sm text-blue-400 truncate block">{folder.password}</code>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(folder.password!, 'pass')}
                                        className={`p-2 rounded-lg transition-all ${copiedId === 'pass' ? 'bg-green-500/20 text-green-500' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        {copiedId === 'pass' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/10 flex gap-4">
                            <div className="p-2 bg-orange-500/10 rounded-lg h-fit">
                                <Key className="w-4 h-4 text-orange-500" />
                            </div>
                            <div className="text-sm text-slate-400 leading-relaxed">
                                Use your system credentials (<span className="text-white">root</span>) to access this share.
                                Newer shares will have individual credentials.
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-all"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConnectionModal;
