import { Router } from 'express';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notification.controller';
import { protect } from '../middlewares/auth';

const router = Router();

router.get('/', protect, getMyNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

export default router;
