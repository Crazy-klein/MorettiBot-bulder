import express from 'express';
import { BotModel } from '../models/Bot.js';
import { ActionLogModel } from '../models/ActionLog.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.get('/dashboard', isAuthenticated, (req, res) => {
  const userId = (req.session as any).userId;
  const username = (req.session as any).username;
  
  const bots = BotModel.findByUserId(userId);
  const logs = ActionLogModel.findByUserId(userId);

  res.render('dashboard', { 
    user: { username }, 
    bots, 
    logs,
    activeMenu: 'dashboard'
  });
});

export default router;
