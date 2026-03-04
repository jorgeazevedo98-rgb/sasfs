import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(401).json({ error: 'Token error' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ error: 'Token malformed' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
        if (err) {
            return res.status(401).json({ error: 'Token invalid' });
        }

        (req as any).user = decoded;
        return next();
    });
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Administrator privileges required' });
    }

    next();
};
