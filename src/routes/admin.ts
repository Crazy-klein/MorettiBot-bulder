import express from 'express';
import { UserModel } from '../models/User.js';
import { BotModel } from '../models/Bot.js';
import { ActionLogModel } from '../models/ActionLog.js';
import { CommandModel } from '../models/Command.js';
import { SettingModel } from '../models/Setting.js';
import { MarketplaceModel } from '../models/Marketplace.js';
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

// MODULE 1: GESTION DES COMMANDES
router.get('/admin/commands', (req, res) => {
  const commands = CommandModel.findAll();
  const freeLimit = SettingModel.get('free_commands_limit') || '52';
  res.render('admin/commands', { commands, freeLimit, activeMenu: 'admin' });
});

router.put('/api/admin/commands/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { isFree, isActive } = req.body;
  const updateData: any = {};
  if (isFree !== undefined) updateData.isFree = isFree ? 1 : 0;
  if (isActive !== undefined) updateData.isActive = isActive ? 1 : 0;
  
  CommandModel.update(id, updateData);
  res.json({ success: true });
});

router.put('/api/admin/settings/free_limit', (req, res) => {
  const { limit } = req.body;
  if (limit !== undefined) {
    SettingModel.set('free_commands_limit', limit.toString());
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false });
  }
});

// MODULE 3: MARKETPLACE APPROVAL
router.get('/admin/marketplace', (req, res) => {
  const pendingBots = MarketplaceModel.findPending();
  res.render('admin/marketplace', { pendingBots, activeMenu: 'admin' });
});

router.post('/admin/marketplace/:id/approve', (req, res) => {
  const id = parseInt(req.params.id);
  MarketplaceModel.updateBotStatus(id, 'approved');
  res.redirect('/admin/marketplace');
});

router.post('/admin/marketplace/:id/reject', (req, res) => {
  const id = parseInt(req.params.id);
  MarketplaceModel.updateBotStatus(id, 'rejected');
  res.redirect('/admin/marketplace');
});

export default router;
