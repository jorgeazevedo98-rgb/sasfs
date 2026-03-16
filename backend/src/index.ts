import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import folderRoutes from './routes/folderRoutes';
import authRoutes from './routes/authRoutes';
import alertRoutes from './routes/alertRoutes';
import userRoutes from './routes/userRoutes';
import { authMiddleware } from './middleware/authMiddleware';

dotenv.config();

const app = express();
const port = 9002;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/folders', authMiddleware, folderRoutes);
app.use('/api/alerts', authMiddleware, alertRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', server: 'Filesystem (SAS) Backend' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
