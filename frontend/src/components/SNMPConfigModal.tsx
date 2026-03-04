import React from 'react';
import { X, Radio, Save, ShieldCheck, Activity } from 'lucide-react';

interface SNMPConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SNMPConfigModal: React.FC<SNMPConfigModalProps> = ({ isOpen, onClose }) => {
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
                        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
                            <Radio className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">SNMP Monitoring</h3>
                            <p className="text-sm text-slate-500">Configure network management protocol</p>
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
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-green-500" />
                                <div>
                                    <div className="text-sm font-bold text-white leading-none">Enable SNMP v2c</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Read-Only Access</div>
                                </div>
                            </div>
                            <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer ring-4 ring-blue-500/10">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Community String</label>
                            <input type="text" placeholder="public" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all text-sm font-mono" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Allowed IPs (CIDR)</label>
                            <input type="text" placeholder="192.168.1.0/24" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all text-sm font-mono" />
                        </div>
                    </div>

                    <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-start gap-4">
                        <Activity className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Enabling SNMP allows tools like Zabbix, PRTG, or Grafana to poll storage metrics from this machine automatically.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 group"
                    >
                        <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Update Monitor Config
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SNMPConfigModal;
