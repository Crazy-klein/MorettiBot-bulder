import express from 'express';
import { BotModel } from '../models/Bot.js';
import { UserModel } from '../models/User.js';
import { ActionLogModel } from '../models/ActionLog.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { SessionManager } from '../services/sessionManager.js';
import { BotGenerator } from '../services/botGenerator.js';
import { NotificationModel } from '../models/Notification.js';
import { BotBackupModel } from '../models/BotBackup.js';
import { GithubService } from '../services/githubService.js';
import { EncryptionUtils } from '../utils/encryption.js';
import logger from '../utils/logger.js';
import { z } from 'zod';
import path from 'path';
import fs from 'fs-extra';

const router = express.Router();

const botSchema = z.object({
  name: z.string().min(3, "Nom trop court"),
  type: z.enum(['MDX', 'East', 'Custom']),
  ownerName: z.string().min(2),
  ownerNumber: z.string().regex(/^\d+$/, "Numéro invalide"),
  prefix: z.string().max(1),
  modules: z.array(z.string()).optional()
});

router.get('/bots/new', isAuthenticated, (req, res) => {
  res.render('bot-config', { errors: [], data: {}, activeMenu: 'bots' });
});

router.post('/api/bots/generate', isAuthenticated, async (req, res) => {
  const userId = (req.session as any).userId;
  
  try {
    const data = botSchema.parse({
      ...req.body,
      modules: Array.isArray(req.body.modules) ? req.body.modules : (req.body.modules ? [req.body.modules] : [])
    });

    const botId = BotModel.create({
      userId,
      name: data.name,
      type: data.type,
      prefix: data.prefix,
      config: JSON.stringify(data),
      status: 'generated'
    });

    // Create automatic backup
    BotBackupModel.create(botId, JSON.stringify(data));
    logger.info({ botId, userId }, 'Nouveau bot généré et sauvegardé');

    ActionLogModel.create(userId, 'Génération de bot', `Le bot ${data.name} a été généré.`);
    NotificationModel.create(userId, 'Génération réussie', `Votre bot "${data.name}" a été généré avec succès et est prêt à être téléchargé.`, 'success');

    const zipPath = await BotGenerator.generateZip({
      name: data.name,
      type: data.type,
      prefix: data.prefix,
      ownerName: data.ownerName,
      ownerNumber: data.ownerNumber,
      modules: data.modules || []
    });

    res.download(zipPath, `${data.name}.zip`, async (err) => {
      await BotGenerator.cleanup(zipPath);
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      logger.warn({ errors: err.issues, userId }, 'Erreur de validation lors de la génération du bot');
      res.render('bot-config', { errors: err.issues, data: req.body, activeMenu: 'bots' });
    } else {
      logger.error({ err, userId }, 'Erreur critique lors de la génération du bot');
      res.status(500).render('error', { message: 'Erreur lors de la génération du ZIP', error: err });
    }
  }
});

router.get('/bots/:id/backups', isAuthenticated, (req, res) => {
  const userId = (req.session as any).userId;
  const botId = parseInt(req.params.id);
  const bot = BotModel.findById(botId);

  if (!bot || bot.userId !== userId) {
    return res.status(403).render('error', { message: 'Accès interdit' });
  }

  const backups = BotBackupModel.findByBotId(botId);
  res.render('bot-backups', { bot, backups, activeMenu: 'bots' });
});

router.post('/bots/:id/restore/:backupId', isAuthenticated, (req, res) => {
  const userId = (req.session as any).userId;
  const botId = parseInt(req.params.id);
  const backupId = parseInt(req.params.backupId);
  const bot = BotModel.findById(botId);

  if (!bot || bot.userId !== userId) {
    return res.status(403).render('error', { message: 'Accès interdit' });
  }

  const backup = BotBackupModel.findById(backupId);
  if (backup && backup.botId === botId) {
    const config = JSON.parse(backup.config);
    BotModel.update(botId, {
      name: config.name,
      type: config.type,
      prefix: config.prefix,
      config: backup.config
    });
    NotificationModel.create(userId, 'Restauration réussie', `Le bot "${bot.name}" a été restauré vers la version v${backup.version}.`, 'success');
    logger.info({ botId, backupId, userId }, 'Bot restauré depuis une sauvegarde');
    res.redirect('/dashboard');
  } else {
    res.status(404).render('error', { message: 'Sauvegarde non trouvée' });
  }
});

router.post('/bots/:id/start-session', isAuthenticated, async (req, res) => {
  const userId = (req.session as any).userId;
  const botId = parseInt(req.params.id);
  const bot = BotModel.findById(botId);

  if (!bot || bot.userId !== userId) {
    return res.status(403).send('Interdit');
  }

  await SessionManager.startSession(botId);
  ActionLogModel.create(userId, 'Démarrage session', `Session en ligne lancée pour ${bot.name}`);
  NotificationModel.create(userId, 'Session lancée', `La session en ligne pour "${bot.name}" est en attente de scan QR.`, 'info');
  res.redirect(`/bots/${botId}/session`);
});

router.get('/bots/:id/session', isAuthenticated, (req, res) => {
  const userId = (req.session as any).userId;
  const botId = parseInt(req.params.id);
  const bot = BotModel.findById(botId);

  if (!bot || bot.userId !== userId) {
    return res.status(403).render('error', { message: 'Accès interdit' });
  }

  const session = SessionManager.getSessionInfo(botId);
  res.render('bot-session', { bot, session, activeMenu: 'bots' });
});

router.get('/api/bots/:id/session-status', isAuthenticated, (req, res) => {
  const botId = parseInt(req.params.id);
  const session = SessionManager.getSessionInfo(botId);
  res.json(session);
});

router.post('/api/bots/:id/push-to-github', isAuthenticated, async (req, res) => {
  const userId = (req.session as any).userId;
  const botId = parseInt(req.params.id);
  const { repoName, isPrivate } = req.body;
  const bot = BotModel.findById(botId);

  if (!bot || bot.userId !== userId) {
    return res.status(403).json({ success: false, error: 'Accès interdit' });
  }

  const encryptedToken = UserModel.getGithubToken(userId);
  if (!encryptedToken) {
    return res.status(400).json({ success: false, error: 'GitHub non lié' });
  }

  try {
    const user = UserModel.findById(userId);
    const repo = await GithubService.createRepository(encryptedToken, repoName, isPrivate === 'true');
    const repoUrl = await GithubService.pushToHub(encryptedToken, user!.githubUsername!, repo.name, ''); // On passe vide car le service README pour l'instant
    
    ActionLogModel.create(userId, 'Push GitHub', `Bot ${bot.name} poussé vers ${repoUrl}`);
    NotificationModel.create(userId, 'GitHub : Déploiement réussi', `Votre bot est maintenant disponible sur GitHub : ${repoUrl}`, 'success');
    
    res.json({ success: true, url: repoUrl });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Garder l'ancienne route /api/bots/:id/status pour compatibilité si nécessaire
router.get('/api/bots/:id/status', isAuthenticated, (req, res) => {
  const botId = parseInt(req.params.id);
  const session = SessionManager.getSessionInfo(botId);
  res.json(session);
});

router.post('/bots/:id/stop-session', isAuthenticated, async (req, res) => {
  const userId = (req.session as any).userId;
  const botId = parseInt(req.params.id);
  const bot = BotModel.findById(botId);

  if (bot && bot.userId === userId) {
    await SessionManager.stopSession(botId);
    ActionLogModel.create(userId, 'Arrêt session', `Session arrêtée proprement pour ${bot.name}`);
    NotificationModel.create(userId, 'Session arrêtée', `La session de "${bot.name}" a été fermée proprement.`, 'info');
  }
  res.redirect('/dashboard');
});

router.post('/bots/:id/delete', isAuthenticated, (req, res) => {
  const userId = (req.session as any).userId;
  const botId = parseInt(req.params.id);
  BotModel.delete(botId, userId);
  res.redirect('/dashboard');
});

export default router;
