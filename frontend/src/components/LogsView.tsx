import React, { useState, useEffect } from 'react';
import { History, Search, RefreshCw, Clock, User, HardDrive } from 'lucide-react';
import { folderService } from '../services/api';

const LogsView: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await folderService.getAuditLogs();
            setLogs(data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000);
        return () => clearInterval(interval);
    }, []);

    const filteredLogs = logs.filter(log => 
        log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.share.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.path.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">File System Audit</h2>
                    <p className="text-slate-500 text-sm mt-1">Real-time file operation history</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search shares users or logs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-12 pr-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none w-80 transition-all"
                        />
                    </div>
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-slate-400 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="glass-container border-white/[0.05] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/[0.02] border-b border-white/[0.04]">
                            <tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="px-8 py-5">Timestamp</th>
                                <th className="px-8 py-5">User</th>
                                <th className="px-8 py-5 text-center">Action</th>
                                <th className="px-8 py-5">File / Folder</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-4 bg-white/5 rounded-full">
                                                <History className="w-8 h-8 text-slate-600" />
                                            </div>
                                            <p className="text-slate-500 font-medium">No activity recorded yet in shared folders.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log, idx) => (
                                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-500/10 rounded-lg">
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <span className="text-slate-400 text-xs font-mono">{log.timestamp}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                                    <User className="w-4 h-4 text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{log.user}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{log.ip}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                log.action === 'access' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                log.action === 'write' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                                                    <HardDrive className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="text-xs text-slate-300 font-medium truncate max-w-xs">{log.path}</span>
                                                    <span className="text-[10px] text-blue-400/70 font-bold uppercase tracking-widest">Share: {log.share}</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LogsView;
