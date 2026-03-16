import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Activity, 
  FolderOpen, 
  Bell, 
  LogOut, 
  Plus, 
  Mail, 
  Radio 
} from 'lucide-react';
import { folderService } from './services/api';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import FolderRow from './components/FolderRow';
import Modal from './components/Modal';
import ConnectionModal from './components/ConnectionModal';
import EditQuotaModal from './components/EditQuotaModal';
import SMTPConfigModal from './components/SMTPConfigModal';
import SNMPConfigModal from './components/SNMPConfigModal';
import AlertItem from './components/AlertItem';
import type { Alert } from './components/AlertItem';
import UserManagement from './components/UserManagement';
import LogsView from './components/LogsView';
import LoginPage from './pages/LoginPage';
import { useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import axios from 'axios';
import { formatStorage, calculatePercent } from './utils/storage';

interface Folder {
  id: number;
  name: string;
  path: string;
  limitMB: number;
  usedMB: number;
  share: boolean;
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [systemStorage, setSystemStorage] = useState({ usedMB: 0, totalMB: 0 });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSMTPOpen, setIsSMTPOpen] = useState(false);
  const [isSNMPOpen, setIsSNMPOpen] = useState(false);
  const { isAuthenticated, logout, token, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchFolders = async () => {
    try {
      if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      const data = await folderService.getFolders();
      setFolders(data.folders || []);
      setSystemStorage(data.systemStorage || { usedMB: 0, totalMB: 0 });
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const data = await folderService.getAlerts();
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      if (isAuthenticated) {
        await Promise.all([fetchFolders(), fetchAlerts()]);
      }
      setLoading(false);
    };
    initializeApp();
  }, [isAuthenticated]);

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <Activity className="w-10 h-10 text-blue-500 animate-spin" />
    </div>
  );

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#020617] flex font-[Inter]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-24 px-12 flex items-center justify-between border-b border-white/[0.04]">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search shares paths or logs..." 
              className="w-full pl-12 pr-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" 
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs font-black text-white">{user?.username || 'Administrator'}</p>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">System {user?.role}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border border-white/20 shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <button onClick={logout} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl border border-red-500/20 transition-all active:scale-95"><LogOut className="w-5 h-5" /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          {activeTab === 'dashboard' ? (
            <div className="grid grid-cols-3 gap-8 animate-slide-up">
              <StatCard 
                label="Storage Capacity" 
                value={formatStorage(systemStorage.totalMB)} 
                subtext={`${calculatePercent(systemStorage.usedMB, systemStorage.totalMB)}% total utilization`} 
                icon={Database} 
                iconColor="text-blue-500" 
                progress={calculatePercent(systemStorage.usedMB, systemStorage.totalMB)} 
              />
              <StatCard label="Active Folders" value={folders.length.toString().padStart(2, '0')} subtext="Accessible via Samba protocol" icon={FolderOpen} iconColor="text-green-500" />
              <StatCard label="System Alerts" value={alerts.length.toString().padStart(2, '0')} subtext="Critical disk thresholds" icon={Bell} iconColor={alerts.some(a => a.type === 'critical') ? "text-red-500" : "text-orange-500"} />
            </div>
          ) : activeTab === 'alerts' ? (
            <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
              <div className="flex items-center justify-between mb-10">
                <div><h2 className="text-2xl font-black text-white tracking-tight">Active Notifications</h2><p className="text-slate-500 text-sm mt-1">Found {alerts.length} system events</p></div>
                <div className="flex items-center gap-3">
                  {isAdmin && <><button onClick={() => setIsSMTPOpen(true)} className="px-5 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl border border-white/5 text-sm font-bold"><Mail className="w-4 h-4" /> SMTP</button><button onClick={() => setIsSNMPOpen(true)} className="px-5 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl border border-white/5 text-sm font-bold"><Radio className="w-4 h-4" /> SNMP</button></>}
                  <button onClick={fetchFolders} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-slate-400 hover:text-white"><Activity className="w-5 h-5" /></button>
                </div>
              </div>
              {alerts.length === 0 ? <div className="glass-container p-20 flex flex-col items-center justify-center">Everything looks optimal.</div> : alerts.map(alert => <AlertItem key={alert.id} alert={alert} onAction={(id) => { const f = folders.find(fo => fo.id === id); if (f) { setSelectedFolder(f); setIsEditOpen(true); } }} />)}
            </div>
          ) : activeTab === 'folders' ? (
            <div className="animate-slide-up space-y-6">
              <div className="flex items-center justify-between px-2">
                <div><h2 className="text-2xl font-black text-white tracking-tight">Active Shares</h2><p className="text-slate-500 text-sm mt-1">Manage network storage</p></div>
                {isAdmin && <button onClick={() => setIsModalOpen(true)} className="premium-btn group py-3 px-6"><Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> New Share</button>}
              </div>
              <div className="glass-container overflow-hidden border-white/[0.05]">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.02]">
                    <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      <th className="px-8 py-5">Share Identity</th>
                      <th className="px-8 py-5">System Path</th>
                      <th className="px-8 py-5 text-[10px]">Provisioned</th>
                      <th className="px-8 py-5">Usage</th>
                      <th className="px-8 py-5 text-center">Status</th>
                      <th className="px-8 py-5 text-right">Settings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {folders.map(folder => <FolderRow key={folder.id} folder={folder} onDelete={fetchFolders} onDetails={(f) => { setSelectedFolder(f); setIsDetailsOpen(true); }} onEdit={(f) => { setSelectedFolder(f); setIsEditOpen(true); }} />)}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (activeTab === 'users' && isAdmin) ? <UserManagement /> : activeTab === 'logs' ? <LogsView /> : null}
        </div>
      </main>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchFolders} />
      {selectedFolder && <ConnectionModal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} folder={selectedFolder} />}
      {selectedFolder && <EditQuotaModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onSuccess={fetchFolders} folder={selectedFolder} />}
      <SMTPConfigModal isOpen={isSMTPOpen} onClose={() => setIsSMTPOpen(false)} />
      <SNMPConfigModal isOpen={isSNMPOpen} onClose={() => setIsSNMPOpen(false)} />
    </div>
  );
}

import { AuthProvider } from './context/AuthContext';
function App() { return <AuthProvider><NotificationProvider><AppContent /></NotificationProvider></AuthProvider>; }
export default App;
