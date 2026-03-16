import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../utils/database';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const users = await db.getUsers();
        let user;

        // If no users exist, allow default admin login
        if (users.length === 0) {
            if (username.toLowerCase() === 'admin' && password === 'admin123') {
                user = { username, role: 'admin' };
            }
        } else {
            const dbUser = await db.getUserByUsername(username);
            if (dbUser && await bcrypt.compare(password, dbUser.passwordHash)) {
                user = { username: dbUser.username, role: dbUser.role };
            }
        }

        if (!user) {
            return res.status(401).json({ error: 'Auth failed' });
        }

        const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        return res.json({
            token,
            user
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
