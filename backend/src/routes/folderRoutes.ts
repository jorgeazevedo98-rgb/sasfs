import { Router } from 'express';
import folderController from '../controllers/folderController';
import { adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/', adminMiddleware, folderController.createFolder);
router.get('/', folderController.getFolders);
router.delete('/:id', adminMiddleware, folderController.deleteFolder);
router.patch('/:id', adminMiddleware, folderController.updateFolder);

export default router;
