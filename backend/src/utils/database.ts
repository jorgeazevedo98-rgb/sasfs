import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'database.json');

export interface Folder {
    id: number;
    name: string;
    path: string;
    limitMB: number;
    usedMB: number;
    share: boolean;
    username?: string;
    password?: string;
}

export interface User {
    id: number;
    username: string;
    passwordHash: string;
    role: 'admin' | 'user';
    createdAt: string;
}

class Database {
    private data: { folders: Folder[], users: User[] } = { folders: [], users: [] };

    constructor() {
        this.init();
    }

    async init() {
        try {
            const content = await fs.readFile(DB_PATH, 'utf-8');
            this.data = JSON.parse(content);
        } catch (error) {
            await this.save();
        }
    }

    async save() {
        await fs.writeFile(DB_PATH, JSON.stringify(this.data, null, 2));
    }

    async getFolders(): Promise<Folder[]> {
        await this.init();
        return this.data.folders;
    }

    async addFolder(folder: Omit<Folder, 'id' | 'usedMB'>): Promise<Folder> {
        await this.init();
        const newFolder: Folder = {
            ...folder,
            id: Date.now(),
            usedMB: 0
        };
        this.data.folders.push(newFolder);
        await this.save();
        return newFolder;
    }

    async deleteFolder(id: number): Promise<boolean> {
        await this.init();
        const initialLength = this.data.folders.length;
        this.data.folders = this.data.folders.filter(f => f.id !== id);
        if (this.data.folders.length !== initialLength) {
            await this.save();
            return true;
        }
        return false;
    }

    async updateFolder(id: number, folderData: Partial<Folder>): Promise<Folder | null> {
        await this.init();
        const folderIndex = this.data.folders.findIndex(f => f.id === id);
        if (folderIndex === -1) return null;

        this.data.folders[folderIndex] = {
            ...this.data.folders[folderIndex],
            ...folderData
        };
        await this.save();
        return this.data.folders[folderIndex];
    }

    // User Methods
    async getUsers(): Promise<User[]> {
        await this.init();
        return this.data.users || [];
    }

    async addUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
        await this.init();
        if (!this.data.users) this.data.users = [];
        const newUser: User = {
            ...user,
            id: Date.now(),
            createdAt: new Date().toISOString()
        };
        this.data.users.push(newUser);
        await this.save();
        return newUser;
    }

    async deleteUser(id: number): Promise<boolean> {
        await this.init();
        if (!this.data.users) return false;
        const initialLength = this.data.users.length;
        this.data.users = this.data.users.filter(u => u.id !== id);
        if (this.data.users.length !== initialLength) {
            await this.save();
            return true;
        }
        return false;
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        await this.init();
        return (this.data.users || []).find(u => u.username === username);
    }

    async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
        await this.init();
        if (!this.data.users) return null;
        const index = this.data.users.findIndex(u => u.id === id);
        if (index === -1) return null;

        this.data.users[index] = {
            ...this.data.users[index],
            ...userData
        };
        await this.save();
        return this.data.users[index];
    }
}

export default new Database();
