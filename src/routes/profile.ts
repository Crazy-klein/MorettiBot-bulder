import express from 'express';
import { UserModel } from '../models/User.js';
import { AuthService } from '../services/authService.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.get('/profile', isAuthenticated, (req, res) => {
  const userId = (req.session as any).userId;
  const user = UserModel.findById(userId);
  res.render('profile', { user, error: null, success: null, activeMenu: 'profile' });
});

router.post('/profile', isAuthenticated, async (req, res) => {
  const userId = (req.session as any).userId;
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const user = UserModel.findById(userId);

  if (!user || !user.password) return res.redirect('/login');

  if (!(await AuthService.comparePassword(currentPassword, user.password))) {
    return res.render('profile', { user, error: 'Mot de passe actuel incorrect', success: null, activeMenu: 'profile' });
  }

  if (newPassword !== confirmPassword) {
    return res.render('profile', { user, error: 'Les nouveaux mots de passe ne correspondent pas', success: null, activeMenu: 'profile' });
  }

  const hashedPassword = await AuthService.hashPassword(newPassword);
  UserModel.updatePassword(userId, hashedPassword);

  res.render('profile', { user, error: null, success: 'Mot de passe mis à jour avec succès', activeMenu: 'profile' });
});

export default router;
