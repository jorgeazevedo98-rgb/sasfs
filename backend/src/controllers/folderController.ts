import { Request, Response } from 'express';
import sambaService from '../services/sambaService';
import storageService from '../services/storageService';
import userService from '../services/userService';
import db from '../utils/database';

export class FolderController {
    async createFolder(req: Request, res: Response) {
        const { name, path, limitMB, share } = req.body;
        if (!name || !path) return res.status(400).json({ message: 'Name and path are required' });
        try {
            const username = name.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000);
            const password = userService.generatePassword();
            const userCreated = await userService.createSystemUser(username, password, path);
            if (!userCreated) throw new Error('Failed to create system user');
            if (share) await sambaService.createShare(name, path, username);
            if (limitMB) await storageService.setQuota(path, limitMB).catch(e => console.warn(e));
            const newFolder = await db.addFolder({ name, path, limitMB, share, username, password });
            res.status(201).json({ message: 'Folder share initialized successfully', folder: newFolder });
        } catch (error: any) {
            res.status(500).json({ message: 'Error creating folder', error: error.message });
        }
    }

    async getFolders(req: Request, res: Response) {
        try {
            const folders = await db.getFolders();
            const enrichedFolders = await Promise.all(folders.map(async (folder) => {
                const usedMB = await storageService.getDirectorySize(folder.path);
                return { ...folder, usedMB };
            }));
            const systemStorage = await storageService.getPartitionUsage('/srv/samba');
            res.json({ folders: enrichedFolders, systemStorage });
        } catch (error: any) {
            res.status(500).json({ message: 'Error fetching storage data', error: error.message });
        }
    }

    async deleteFolder(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const folders = await db.getFolders();
            const folder = folders.find(f => f.id === Number(id));
            if (!folder) return res.status(404).json({ message: 'Folder not found' });
            if (folder.username) await userService.deleteSystemUser(folder.username);
            await sambaService.deleteShare(folder.name, folder.path);
            await db.deleteFolder(Number(id));
            res.json({ message: 'Folder deleted successfully' });
        } catch (error: any) {
            res.status(500).json({ message: 'Error deleting folder', error: error.message });
        }
    }

    async updateFolder(req: Request, res: Response) {
        const { id } = req.params;
        const { limitMB, incrementMB } = req.body;
        try {
            const folders = await db.getFolders();
            const folder = folders.find(f => f.id === Number(id));
            if (!folder) return res.status(404).json({ message: 'Folder not found' });
            let newLimit = limitMB;
            if (incrementMB !== undefined) newLimit = (folder.limitMB || 0) + incrementMB;
            if (newLimit !== undefined) await storageService.setQuota(folder.path, newLimit).catch(e => console.warn(e));
            const updated = await db.updateFolder(Number(id), { limitMB: newLimit });
            res.json(updated);
        } catch (error: any) {
            res.status(500).json({ message: 'Error updating folder', error: error.message });
        }
    }

    async getAuditLogs(req: Request, res: Response) {
        try {
            const logs = await sambaService.getAuditLogs();
            res.json(logs);
        } catch (error: any) {
            res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
        }
    }
}
export default new FolderController();
