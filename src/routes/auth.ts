import express from 'express';
import { z } from 'zod';
import { UserModel } from '../models/User.js';
import { AuthService } from '../services/authService.js';
import { EmailService } from '../services/emailService.js';
import { isGuest, isAuthenticated } from '../middlewares/auth.js';
import crypto from 'crypto';

const router = express.Router();

const registerSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

router.get('/login', isGuest, (req, res) => {
  res.render('login', { error: req.query.error });
});

router.post('/login', isGuest, async (req, res) => {
  const { email, password } = req.body;
  const user = UserModel.findByEmail(email);

  if (user && user.password && await AuthService.comparePassword(password, user.password)) {
    (req.session as any).userId = user.id;
    (req.session as any).username = user.username;
    (req.session as any).isAdmin = user.role === 'admin';
    res.redirect('/dashboard');
  } else {
    res.redirect('/login?error=Identifiants+invalides');
  }
});

router.get('/register', isGuest, (req, res) => {
  res.render('register', { errors: [], data: {} });
});

router.post('/register', isGuest, async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    if (UserModel.findByEmail(validatedData.email)) {
      return res.render('register', { errors: [{ message: 'Cet email est déjà utilisé' }], data: req.body });
    }

    const hashedPassword = await AuthService.hashPassword(validatedData.password);
    const userId = UserModel.create({
      email: validatedData.email,
      username: validatedData.username,
      password: hashedPassword,
      role: 'user'
    });

    (req.session as any).userId = userId;
    (req.session as any).username = validatedData.username;
    (req.session as any).isAdmin = false;
    
    res.redirect('/dashboard');
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.render('register', { errors: err.issues, data: req.body });
    } else {
      res.render('register', { errors: [{ message: 'Une erreur est survenue' }], data: req.body });
    }
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

router.get('/forgot-password', isGuest, (req, res) => {
  res.render('forgot-password', { message: null, error: null });
});

router.post('/forgot-password', isGuest, async (req, res) => {
  const { email } = req.body;
  const user = UserModel.findByEmail(email);

  if (user) {
    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 heure
    UserModel.setResetToken(email, token, expires);
    await EmailService.sendResetPasswordEmail(email, token, req.get('host') || 'localhost');
  }

  res.render('forgot-password', { 
    message: 'Si cet email correspond à un compte, vous recevrez un lien de réinitialisation.', 
    error: null 
  });
});

router.get('/reset-password/:token', isGuest, (req, res) => {
  const user = UserModel.findByResetToken(req.params.token);
  if (!user) {
    return res.render('forgot-password', { message: null, error: 'Le jeton de réinitialisation est invalide ou a expiré.' });
  }
  res.render('reset-password', { token: req.params.token, error: null });
});

router.post('/reset-password/:token', isGuest, async (req, res) => {
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.render('reset-password', { token: req.params.token, error: 'Les mots de passe ne correspondent pas.' });
  }

  const user = UserModel.findByResetToken(req.params.token);
  if (!user) {
    return res.render('forgot-password', { message: null, error: 'Le jeton de réinitialisation est invalide ou a expiré.' });
  }

  const hashedPassword = await AuthService.hashPassword(password);
  UserModel.updatePassword(user.id, hashedPassword);
  UserModel.clearResetToken(user.id);

  res.redirect('/login?success=Mot+de+passe+réinitialisé');
});

export default router;
