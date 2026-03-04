import { Router } from 'express';
import userController from '../controllers/userController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Protect all user management routes - Admin Only
router.use(authMiddleware, adminMiddleware);

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.delete('/:id', userController.deleteUser);
router.patch('/:id/password', userController.changePassword);
router.patch('/:id/role', userController.updateRole);

export default router;
