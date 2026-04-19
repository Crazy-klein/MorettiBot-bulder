import express from 'express';
import { BotModel } from '../models/Bot.js';
import { ActionLogModel } from '../models/ActionLog.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { SessionManager } from '../services/sessionManager.js';
import { BotGenerator } from '../services/botGenerator.js';
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

    ActionLogModel.create(userId, 'Génération de bot', `Le bot ${data.name} a été généré.`);

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
      res.render('bot-config', { errors: err.issues, data: req.body, activeMenu: 'bots' });
    } else {
      console.error(err);
      res.status(500).render('error', { message: 'Erreur lors de la génération', error: err });
    }
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
  res.redirect(`/bots/${botId}/session`);
});

router.get('/bots/:id/session', isAuthenticated, (req, res) => {
  const userId = (req.session as any).userId;
  const botId = parseInt(req.params.id);
  const bot = BotModel.findById(botId);

  if (!bot || bot.userId !== userId) {
    return res.status(403).send('Interdit');
  }

  const session = SessionManager.getSessionStatus(botId);
  res.render('bot-session', { bot, session, activeMenu: 'bots' });
});

router.get('/api/bots/:id/status', isAuthenticated, (req, res) => {
  const botId = parseInt(req.params.id);
  const session = SessionManager.getSessionStatus(botId);
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
