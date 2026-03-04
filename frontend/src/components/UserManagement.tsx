import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Trash2, Loader2, Calendar, Key } from 'lucide-react';
import { userService } from '../services/api';
import NewUserModal from './NewUserModal';
import ChangePasswordModal from './ChangePasswordModal';

interface User {
    id: number;
    username: string;
    role: 'admin' | 'user';
    createdAt: string;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id: number, username: string } | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null);

    const fetchUsers = async () => {
        try {
            const data = await userService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleToggle = async (id: number, currentRole: 'admin' | 'user') => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        setUpdatingRoleId(id);
        try {
            await userService.updateRole(id, newRole);
            await fetchUsers();
        } catch (error) {
            alert('Error updating user role');
            console.error(error);
        } finally {
            setUpdatingRoleId(null);
        }
    };

    const handleChangePassword = (id: number, username: string) => {
        setSelectedUser({ id, username });
        setIsPasswordModalOpen(true);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id: number, username: string) => {
        if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;

        setDeletingId(id);
        try {
            await userService.deleteUser(id);
            await fetchUsers();
        } catch (error) {
            alert('Error deleting user');
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="animate-slide-up space-y-6">
            <div className="flex items-center justify-between px-2">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Platform Users</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage administrative access levels</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="premium-btn group py-3 px-6"
                >
                    <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    New User Account
                </button>
            </div>

            <div className="glass-container overflow-hidden border-white/[0.05]">
                <table className="w-full text-left">
                    <thead className="bg-white/[0.02] border-b border-white/[0.04]">
                        <tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            <th className="px-8 py-5">User Profile</th>
                            <th className="px-8 py-5">Security Role</th>
                            <th className="px-8 py-5">Onboarded</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                        <span className="text-slate-500 text-sm font-medium">Retrieving user registry...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                                            <Users className="w-8 h-8 text-slate-700" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold">No Users Found</h4>
                                            <p className="text-slate-500 text-sm mt-1">Only the default admin can currently access the system.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/[0.03] transition-all duration-300 group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/10">
                                                {user.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors">{user.username}</div>
                                                <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-bold">Standard Account</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button
                                            onClick={() => handleRoleToggle(user.id, user.role)}
                                            disabled={updatingRoleId === user.id}
                                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${user.role === 'admin'
                                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20'
                                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'}`}
                                            title="Click to toggle role"
                                        >
                                            {updatingRoleId === user.id ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <Shield className="w-3 h-3" />
                                            )}
                                            {user.role}
                                        </button>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <Calendar className="w-4 h-4 opacity-40" />
                                            <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleChangePassword(user.id, user.username)}
                                                className="p-2.5 hover:bg-indigo-500/10 rounded-xl text-slate-500 hover:text-indigo-500 transition-all border border-transparent hover:border-indigo-500/20"
                                                title="Change Password"
                                            >
                                                <Key className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id, user.username)}
                                                disabled={deletingId === user.id}
                                                className="p-2.5 hover:bg-red-500/10 rounded-xl text-slate-500 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                                                title="Revoke Access"
                                            >
                                                {deletingId === user.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <NewUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchUsers}
            />

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => {
                    setIsPasswordModalOpen(false);
                    setSelectedUser(null);
                }}
                userId={selectedUser?.id || null}
                username={selectedUser?.username || ''}
            />
        </div>
    );
};

export default UserManagement;
