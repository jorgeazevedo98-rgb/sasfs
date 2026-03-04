import { Request, Response } from 'express';
import sambaService from '../services/sambaService';
import storageService from '../services/storageService';
import userService from '../services/userService';
import db from '../utils/database';

export class FolderController {
    async createFolder(req: Request, res: Response) {
        console.log('[CONTROLLER] Received createFolder request:', req.body);
        const { name, path, limitMB, share } = req.body;

        if (!name || !path) {
            console.error('[CONTROLLER] Missing name or path');
            return res.status(400).json({ message: 'Name and path are required' });
        }

        try {
            // 1. Generate Random Credentials
            const username = name.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000);
            const password = userService.generatePassword();

            // 2. Create System User
            const userCreated = await userService.createSystemUser(username, password, path);
            if (!userCreated) {
                throw new Error('Failed to create system user for this share');
            }

            // 3. Create Samba share
            if (share) {
                const shareCreated = await sambaService.createShare(name, path, username);
                if (!shareCreated) {
                    throw new Error('Failed to create Samba share');
                }
            }

            // 2. Set quota if provided (graceful fail)
            if (limitMB) {
                console.log(`[CONTROLLER] Attempting to set quota: ${limitMB}MB for ${path}`);
                try {
                    await storageService.setQuota(path, limitMB);
                } catch (quotaErr) {
                    console.warn('[CONTROLLER] Quota warning (non-blocking):', quotaErr);
                }
            }

            // 5. Save to database with credentials
            const newFolder = await db.addFolder({
                name,
                path,
                limitMB,
                share,
                username,
                password
            });

            console.log('[CONTROLLER] Success!');
            res.status(201).json({
                message: 'Folder share initialized successfully',
                folder: newFolder
            });
        } catch (error: any) {
            console.error('[CONTROLLER] Error:', error.message);
            res.status(500).json({ message: 'Error creating folder', error: error.message });
        }
    }

    async getFolders(req: Request, res: Response) {
        try {
            const folders = await db.getFolders();

            // Enrich with live usage and quota capacity
            const enrichedFolders = await Promise.all(folders.map(async (folder) => {
                const usedMB = await storageService.getDirectorySize(folder.path);
                // The limit is the quota, usedMB is actual size
                return { ...folder, usedMB };
            }));

            // Get system-wide metrics for the storage root
            const systemStorage = await storageService.getPartitionUsage('/srv/samba');

            res.json({
                folders: enrichedFolders,
                systemStorage
            });
        } catch (error: any) {
            res.status(500).json({ message: 'Error fetching storage data', error: error.message });
        }
    }

    async deleteFolder(req: Request, res: Response) {
        const { id } = req.params;
        console.log(`[CONTROLLER] Received deleteFolder request for ID: ${id}`);

        try {
            const folders = await db.getFolders();
            const folder = folders.find(f => f.id === Number(id));

            if (!folder) {
                return res.status(404).json({ message: 'Folder not found' });
            }

            // 1. Cleanup specialized user and kill active sessions
            if (folder.username) {
                await userService.deleteSystemUser(folder.username);
            }

            // 2. Delete Samba share and directory
            await sambaService.deleteShare(folder.name, folder.path);

            // 3. Remove from database
            await db.deleteFolder(Number(id));

            console.log('[CONTROLLER] Successfully deleted folder');
            res.json({ message: 'Folder deleted successfully' });
        } catch (error: any) {
            console.error('[CONTROLLER] Error deleting folder:', error.message);
            res.status(500).json({ message: 'Error deleting folder', error: error.message });
        }
    }

    async updateFolder(req: Request, res: Response) {
        const { id } = req.params;
        const { limitMB, incrementMB } = req.body;

        try {
            const folders = await db.getFolders();
            const folder = folders.find(f => f.id === Number(id));

            if (!folder) {
                return res.status(404).json({ message: 'Folder not found' });
            }

            let newLimit = limitMB;
            if (incrementMB !== undefined) {
                newLimit = (folder.limitMB || 0) + incrementMB;
            }

            // Update quota (graceful fail)
            if (newLimit !== undefined) {
                try {
                    await storageService.setQuota(folder.path, newLimit);
                } catch (err) {
                    console.warn('[CONTROLLER] Quota update warning:', err);
                }
            }

            const updated = await db.updateFolder(Number(id), { limitMB: newLimit });
            res.json(updated);
        } catch (error: any) {
            res.status(500).json({ message: 'Error updating folder', error: error.message });
        }
    }
}

export default new FolderController();
