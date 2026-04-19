import express from 'express';
import { NotificationModel } from '../../models/Notification.js';
import { isAuthenticated } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/notifications', isAuthenticated, (req, res) => {
  const userId = (req.session as any).userId;
  const notifications = NotificationModel.findByUserId(userId, 50);
  res.render('notifications', { notifications, activeMenu: 'notifications' });
});

router.get('/api/notifications', isAuthenticated, (req, res) => {
  const userId = (req.session as any).userId;
  const notifications = NotificationModel.findByUserId(userId);
  const unreadCount = NotificationModel.countUnread(userId);
  
  res.json({ success: true, notifications, unreadCount });
});

router.post('/api/notifications/mark-read', isAuthenticated, (req, res) => {
  const userId = (req.session as any).userId;
  const { id } = req.body;
  
  if (id) {
    NotificationModel.markAsRead(id, userId);
  } else {
    NotificationModel.markAllAsRead(userId);
  }
  
  res.json({ success: true });
});

router.post('/api/notifications/delete', isAuthenticated, (req, res) => {
  const userId = (req.session as any).userId;
  const { id } = req.body;
  
  if (id) {
    NotificationModel.delete(id, userId);
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: 'ID requis' });
  }
});

export default router;
