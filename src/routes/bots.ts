import express from 'express';
import { BotModel } from '../models/Bot.js';
import { ActionLogModel } from '../models/ActionLog.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { SessionManager } from '../services/sessionManager.js';
import { BotGenerator } from '../services/botGenerator.js';
import { NotificationModel } from '../models/Notification.js';
import { BotBackupModel } from '../models/BotBackup.js';
import { SubscriptionModel } from '../models/Subscription.js';
import { CommandModel } from '../models/Command.js';
import { SettingModel } from '../models/Setting.js';
import logger from '../utils/logger.js';
import { z } from 'zod';
import path from 'path';
import fs from 'fs-extra';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter pour la génération de bot
const generationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10,
  message: 'Limite de génération atteinte (10 par heure).',
  standardHeaders: true,
  legacyHeaders: false,
});

const botSchema = z.object({
  name: z.string().min(3, "Nom trop court").max(50).regex(/^[a-zA-Z0-9 _-]+$/, "Caractères invalides"),
  type: z.enum(['MDX', 'East', 'Custom']),
  ownerName: z.string().min(2).max(50),
  ownerNumber: z.string().regex(/^\d{10,15}$/, "Numéro invalide (format international sans + attendu)"),
  prefix: z.string().length(1, "Le préfixe doit faire exactement 1 caractère"),
  modules: z.array(z.string()).optional()
});

router.get('/bots/new', isAuthenticated, (req, res) => {
  res.render('bot-config', { errors: [], data: {}, activeMenu: 'bots' });
});

router.post('/api/bots/generate', isAuthenticated, generationLimiter, async (req, res) => {
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
    logger.info({ botId, userId }, 'Nouveau bot généré');

    ActionLogModel.create(userId, 'Génération de bot', `Le bot ${data.name} a été généré.`);
    NotificationModel.create(userId, 'Génération réussie', `Votre bot "${data.name}" a été généré avec succès.`, 'success');

    // FILTRAGE DES COMMANDES SELON L'ABONNEMENT
    const subscription = SubscriptionModel.findByUserId(userId);
    const plan = subscription?.plan || 'free';
    let modulesToInclude = data.modules || [];

    if (plan === 'free') {
        const freeLimit = parseInt(SettingModel.get('free_commands_limit') || '52');
        const activeFreeCommands = CommandModel.findFreeActive();
        // Filtrer les modules demandés pour ne garder que ceux qui sont actifs et gratuits
        // Pour simplifier, on vérifie si la commande associée au module est gratuite
        // Ici on va supposer que 'modules' contient des clés techniques de commandes
        modulesToInclude = modulesToInclude.filter(m => activeFreeCommands.some(c => c.key === m));
        // Appliquer la limite
        if (modulesToInclude.length > freeLimit) {
            modulesToInclude = modulesToInclude.slice(0, freeLimit);
        }
    } else {
        // Plan PRO: Toutes les commandes actives
        const activeCommands = CommandModel.findActive();
        modulesToInclude = modulesToInclude.filter(m => activeCommands.some(c => c.key === m));
    }

    const zipPath = await BotGenerator.generateZip({
      name: data.name,
      type: data.type,
      prefix: data.prefix,
      ownerName: data.ownerName,
      ownerNumber: data.ownerNumber,
      modules: modulesToInclude
    });

    // Sécurité : Vérifier le chemin du ZIP
    const resolvedPath = path.resolve(zipPath);
    const tempDir = path.resolve(process.cwd(), 'temp');
    if (!resolvedPath.startsWith(tempDir)) {
      throw new Error('Tentative d\'accès non autorisé au système de fichiers');
    }

    res.download(zipPath, `${data.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`, async (err) => {
      if (err) logger.error(err, 'Erreur téléchargement ZIP');
      await BotGenerator.cleanup(zipPath);
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      logger.warn({ errors: err.issues, userId }, 'Erreur de validation bot');
      res.render('bot-config', { errors: err.issues, data: req.body, activeMenu: 'bots' });
    } else {
      logger.error({ err, userId }, 'Erreur génération bot');
      res.status(500).render('error', { message: 'Erreur lors de la génération', error: err });
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
    ActionLogModel.create(userId, 'Arrêt session', `Session arrêtée pour ${bot.name}`);
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
