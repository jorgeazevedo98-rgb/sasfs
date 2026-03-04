import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../utils/database';

export class UserController {
    async getUsers(req: Request, res: Response) {
        try {
            const users = await db.getUsers();
            // Don't send password hashes to frontend
            const safeUsers = users.map(({ passwordHash, ...user }) => user);
            res.json(safeUsers);
        } catch (error: any) {
            res.status(500).json({ message: 'Error fetching users', error: error.message });
        }
    }

    async createUser(req: Request, res: Response) {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        try {
            const existingUser = await db.getUserByUsername(username);
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const passwordHash = await bcrypt.hash(password, 10);
            const newUser = await db.addUser({
                username,
                passwordHash,
                role: role || 'user'
            });

            const { passwordHash: _, ...safeUser } = newUser;
            res.status(201).json(safeUser);
        } catch (error: any) {
            res.status(500).json({ message: 'Error creating user', error: error.message });
        }
    }

    async deleteUser(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const success = await db.deleteUser(Number(id));
            if (success) {
                res.json({ message: 'User deleted successfully' });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error: any) {
            res.status(500).json({ message: 'Error deleting user', error: error.message });
        }
    }

    async changePassword(req: Request, res: Response) {
        const { id } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        try {
            const passwordHash = await bcrypt.hash(password, 10);
            const user = await db.updateUser(Number(id), { passwordHash });

            if (user) {
                res.json({ message: 'Password updated successfully' });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error: any) {
            res.status(500).json({ message: 'Error updating password', error: error.message });
        }
    }

    async updateRole(req: Request, res: Response) {
        const { id } = req.params;
        const { role } = req.body;

        if (!role || (role !== 'admin' && role !== 'user')) {
            return res.status(400).json({ message: 'Valid role (admin or user) is required' });
        }

        try {
            const user = await db.updateUser(Number(id), { role });

            if (user) {
                res.json({ message: 'User role updated successfully' });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error: any) {
            res.status(500).json({ message: 'Error updating user role', error: error.message });
        }
    }
}

export default new UserController();
