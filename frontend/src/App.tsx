import React, { useState, useEffect } from 'react';
import { Plus, Activity, FolderOpen, Bell, Search, LogOut, Check, Mail, Radio } from 'lucide-react';
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
import LoginPage from './pages/LoginPage';
import { useAuth } from './context/AuthContext';
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
      // Set default auth header for axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const data = await folderService.getFolders();
      // Backend now returns { folders, systemStorage }
      setFolders(data.folders || []);
      setSystemStorage(data.systemStorage || { usedMB: 0, totalMB: 0 });

      // Also fetch alerts
      const alertsData = await folderService.getAlerts();
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error fetching folders:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchFolders();
  }, [isAuthenticated, token, logout]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const systemUsagePercent = calculatePercent(systemStorage.usedMB, systemStorage.totalMB);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-24 px-12 flex items-center justify-between border-b border-white/[0.04] bg-white/[0.01] backdrop-blur-md">
          <div className="flex items-center gap-6 w-full max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search shares, paths or logs..."
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm text-white placeholder-slate-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 group">
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/10">
                  {user?.username?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white leading-none capitalize">{user?.username || 'Admin'}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Administrator</div>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-3 bg-white/5 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-2xl border border-white/5 transition-all active:scale-90"
                title="Auth Session Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Action Bar */}
        <div className="px-12 py-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              {activeTab === 'dashboard' ? 'Infra Overview' :
                activeTab === 'alerts' ? 'Health Monitor' :
                  activeTab === 'users' ? 'Identity & Access' :
                    'Share Management'}
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              {activeTab === 'dashboard' ? 'Real-time storage metrics and health' :
                activeTab === 'alerts' ? 'System notifications and storage thresholds' :
                  activeTab === 'users' ? 'Administrative security and platform accounts' :
                    'Configure and monitor your network drives'}
            </p>
          </div>

          <div className="flex items-center gap-4" />
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-12 pb-12 space-y-10 custom-scrollbar">
          {activeTab === 'dashboard' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
              <StatCard
                label="Total Storage Load"
                value={formatStorage(systemStorage.usedMB)}
                subtextText={`of ${formatStorage(systemStorage.totalMB)} mounted`}
                icon={Activity}
                iconColor="text-blue-500"
                progress={parseFloat(systemUsagePercent.toFixed(1))}
              />
              <StatCard
                label="Network Shares"
                value={folders.filter(f => f.share).length}
                subtextText="Accessible via Samba protocol"
                icon={FolderOpen}
                iconColor="text-green-500"
              />
              <StatCard
                label="System Alerts"
                value={alerts.length.toString().padStart(2, '0')}
                subtextText="Critical disk thresholds"
                icon={Bell}
                iconColor={alerts.some(a => a.type === 'critical') ? "text-red-500" : "text-orange-500"}
              />
            </div>
          ) : activeTab === 'alerts' ? (
            <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Active Notifications</h2>
                  <p className="text-slate-500 text-sm mt-1">Found {alerts.length} system events requiring attention</p>
                </div>
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => setIsSMTPOpen(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-2xl border border-white/5 transition-all active:scale-95 text-sm font-bold"
                      >
                        <Mail className="w-4 h-4" />
                        SMTP Config
                      </button>
                      <button
                        onClick={() => setIsSNMPOpen(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-2xl border border-white/5 transition-all active:scale-95 text-sm font-bold"
                      >
                        <Radio className="w-4 h-4" />
                        SNMP Config
                      </button>
                    </>
                  )}
                  <button
                    onClick={fetchFolders}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-slate-400 hover:text-white transition-all active:scale-95"
                    title="Force Refresh"
                  >
                    <Activity className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {alerts.length === 0 ? (
                <div className="glass-container p-20 flex flex-col items-center justify-center text-center border-dashed border-white/5">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                    <Check className="w-10 h-10 text-green-500/50" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">System Clear</h3>
                  <p className="text-slate-500 max-w-xs">Everything looks optimal. No critical alerts at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {alerts.map(alert => (
                    <AlertItem
                      key={alert.id}
                      alert={alert}
                      onAction={(folderId) => {
                        const folder = folders.find(f => f.id === folderId);
                        if (folder) {
                          setSelectedFolder(folder);
                          setIsEditOpen(true);
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'folders' ? (
            <div className="animate-slide-up space-y-6">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Active Shares</h2>
                  <p className="text-slate-500 text-sm mt-1">Manage your provisioned network storage</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="premium-btn group py-3 px-6"
                  >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    New Storage Share
                  </button>
                )}
              </div>
              <div className="glass-container overflow-hidden border-white/[0.05]">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.02] border-b border-white/[0.04]">
                    <tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                      <th className="px-8 py-5">Share Identity</th>
                      <th className="px-8 py-5">System Path</th>
                      <th className="px-8 py-5">Provisioned</th>
                      <th className="px-8 py-5">Usage Curve</th>
                      <th className="px-8 py-5 text-center">Status</th>
                      <th className="px-8 py-5 text-right">Settings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {folders.map(folder => (
                      <FolderRow
                        key={folder.id}
                        folder={folder}
                        onDelete={fetchFolders}
                        onDetails={(f) => {
                          setSelectedFolder(f);
                          setIsDetailsOpen(true);
                        }}
                        onEdit={(f) => {
                          setSelectedFolder(f);
                          setIsEditOpen(true);
                        }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (activeTab === 'users' && isAdmin) ? (
            <UserManagement />
          ) : null}

          {/* Visualization Placeholder */}
          {activeTab === 'dashboard' && (
            <div className="glass-container p-10 h-80 flex flex-col items-center justify-center gap-4 text-center border-dashed border-white/5 bg-transparent">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center animate-pulse">
                <Activity className="w-10 h-10 text-blue-500/50" />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg">Detailed Analytics</h4>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">Connecting to the monitoring agent... Detailed time-series data will appear here shortly.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchFolders}
      />

      {selectedFolder && (
        <ConnectionModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          folder={selectedFolder}
        />
      )}

      {selectedFolder && (
        <EditQuotaModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSuccess={fetchFolders}
          folder={selectedFolder}
        />
      )}

      {/* Configuration Modals */}
      <SMTPConfigModal
        isOpen={isSMTPOpen}
        onClose={() => setIsSMTPOpen(false)}
      />

      <SNMPConfigModal
        isOpen={isSNMPOpen}
        onClose={() => setIsSNMPOpen(false)}
      />
    </div>
  );
}

// Main App that wraps with AuthProvider
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
