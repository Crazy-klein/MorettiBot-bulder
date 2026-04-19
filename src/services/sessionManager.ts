import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion 
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import pino from 'pino';
import QRCode from 'qrcode';
import { BotModel } from '../models/Bot.js';
import { NotificationModel } from '../models/Notification.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Session {
  socket: any;
  qr?: string;
  status: 'connecting' | 'qr' | 'connected' | 'disconnected';
}

const activeSessions: Map<number, Session> = new Map();

export const SessionManager = {
  startSession: async (botId: number) => {
    const sessionDir = path.resolve(__dirname, `../../sessions/bot_${botId}`);
    await fs.ensureDir(sessionDir);

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: logger as any,
    });

    activeSessions.set(botId, { socket: sock, status: 'connecting' });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      const session = activeSessions.get(botId);
      if (!session) return;

      if (qr) {
        session.qr = await QRCode.toDataURL(qr);
        session.status = 'qr';
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        logger.debug({ botId, error: lastDisconnect?.error, shouldReconnect }, 'WhatsApp connection closed');
        
        if (shouldReconnect) {
          SessionManager.startSession(botId);
        } else {
          const bot = BotModel.findById(botId);
          if (bot) {
            NotificationModel.create(bot.userId, 'Bot Déconnecté', `Le bot "${bot.name}" a été déconnecté.`, 'warning');
            logger.warn({ botId, userId: bot.userId }, 'Bot déconnecté et déloggé');
          }
          activeSessions.delete(botId);
          BotModel.updateStatus(botId, 'stopped');
          await fs.remove(sessionDir);
        }
      } else if (connection === 'open') {
        logger.info({ botId }, 'WhatsApp connection opened');
        session.status = 'connected';
        session.qr = undefined;
        BotModel.updateStatus(botId, 'running');
        const bot = BotModel.findById(botId);
        if (bot) {
          NotificationModel.create(bot.userId, 'Bot Connecté', `Votre bot "${bot.name}" est maintenant opérationnel sur WhatsApp.`, 'success');
        }
      }
    });

    return sock;
  },

  stopSession: async (botId: number) => {
    const session = activeSessions.get(botId);
    if (session) {
      try {
        await session.socket.logout();
      } catch (e) {}
      activeSessions.delete(botId);
    }
    const sessionDir = path.resolve(__dirname, `../../sessions/bot_${botId}`);
    await fs.remove(sessionDir);
    BotModel.updateStatus(botId, 'stopped');
  },

  getSessionStatus: (botId: number) => {
    const session = activeSessions.get(botId);
    if (!session) return { status: 'stopped' };
    return {
      status: session.status,
      qr: session.qr
    };
  }
};
