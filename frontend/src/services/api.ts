import axios from 'axios';
import { getBaseURL } from '../utils/url';

const api = axios.create({
    baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('sas_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const folderService = {
    getFolders: async () => {
        const response = await api.get('/folders');
        return response.data;
    },
    createFolder: async (folderData: any) => {
        const response = await api.post('/folders', folderData);
        return response.data;
    },
    deleteFolder: async (id: number) => {
        const response = await api.delete(`/folders/${id}`);
        return response.data;
    },
    updateFolder: async (id: number, data: any) => {
        const response = await api.patch(`/folders/${id}`, data);
        return response.data;
    },
    getAuditLogs: async () => {
        const response = await api.get('/folders/audit-logs');
        return response.data;
    },
    getAlerts: async () => {
        const response = await api.get('/folders/alerts');
        return response.data;
    }
};

export const userService = {
    getUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    },
    createUser: async (userData: any) => {
        const response = await api.post('/users', userData);
        return response.data;
    },
    deleteUser: async (id: number) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },
    changePassword: async (id: number, password: string) => {
        const response = await api.patch(`/users/${id}/password`, { password });
        return response.data;
    },
    updateRole: async (id: number, role: string) => {
        const response = await api.patch(`/users/${id}/role`, { role });
        return response.data;
    }
};

export default api;
