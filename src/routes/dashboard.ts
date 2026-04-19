import express from 'express';
import { BotModel } from '../models/Bot.js';
import { UserModel } from '../models/User.js';
import { ActionLogModel } from '../models/ActionLog.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.get('/dashboard', isAuthenticated, (req, res) => {
  const userId = (req.session as any).userId;
  const username = (req.session as any).username;
  
  const bots = BotModel.findByUserId(userId);
  const logs = ActionLogModel.findByUserId(userId);
  const user = UserModel.findById(userId);

  res.render('dashboard', { 
    user, 
    bots, 
    logs,
    activeMenu: 'dashboard'
  });
});

export default router;
