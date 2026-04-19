import express from 'express';
import { UserModel } from '../models/User.js';
import { BotModel } from '../models/Bot.js';
import { ActionLogModel } from '../models/ActionLog.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/admin.js';

const router = express.Router();

router.use(isAuthenticated, isAdmin);

router.get('/admin', (req, res) => {
  const userCount = UserModel.findAll().length;
  const botCount = BotModel.countAll();
  const activeSessions = BotModel.countActiveSessions();
  const recentLogs = ActionLogModel.findAll(20);

  res.render('admin/index', { 
    stats: { userCount, botCount, activeSessions },
    recentLogs,
    activeMenu: 'admin'
  });
});

router.get('/admin/users', (req, res) => {
  const users = UserModel.findAll();
  res.render('admin/users', { users, activeMenu: 'admin' });
});

router.post('/admin/users/:id/role', (req, res) => {
  const userId = parseInt(req.params.id);
  const { role } = req.body;
  if (role === 'user' || role === 'admin') {
    UserModel.updateRole(userId, role);
  }
  res.redirect('/admin/users');
});

export default router;
