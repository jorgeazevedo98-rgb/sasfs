import React from 'react';
import { Layout, FolderOpen, Bell, Database, Users, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Layout },
        { id: 'folders', label: 'Folders', icon: FolderOpen },
        { id: 'alerts', label: 'Alerts', icon: Bell },
        ...(isAdmin ? [
            { id: 'users', label: 'Users', icon: Users },
            { id: 'logs', label: 'Audit Logs', icon: History }
        ] : []),
    ];

    return (
        <aside className="w-72 glass-container m-6 mr-0 flex flex-col items-center py-10">
            <div className="flex items-center gap-4 mb-16 px-8 self-start">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-[0_8px_20px_rgba(59,130,246,0.4)]">
                    <Database className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">SAS FS</h2>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">Management</p>
                </div>
            </div>

            <nav className="flex-1 w-full px-6 space-y-3">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full nav-item ${activeTab === item.id ? 'active' : ''}`}
                    >
                        <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-500' : ''}`} />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
