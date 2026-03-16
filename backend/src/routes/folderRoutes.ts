import { Router } from 'express';
import folderController from '../controllers/folderController';
import alertController from '../controllers/alertController';
import { adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/', adminMiddleware, folderController.createFolder);
router.get('/', folderController.getFolders);
router.delete('/:id', adminMiddleware, folderController.deleteFolder);
router.patch('/:id', adminMiddleware, folderController.updateFolder);
router.get('/audit-logs', adminMiddleware, folderController.getAuditLogs);
router.get('/alerts', alertController.getAlerts);

export default router;
