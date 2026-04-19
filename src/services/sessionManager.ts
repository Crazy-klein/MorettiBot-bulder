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
  pairingCode?: string;
  status: 'connecting' | 'qr' | 'pairing' | 'connected' | 'disconnected' | 'error';
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

    const session: Session = { socket: sock, status: 'connecting' };
    activeSessions.set(botId, session);

    // Gérer le code d'appairage si pas encore enregistré
    if (!sock.authState.creds.registered) {
      const bot = BotModel.findById(botId);
      if (bot) {
        try {
          const config = JSON.parse(bot.config);
          const phoneNumber = config.ownerNumber?.replace(/[^0-9]/g, '');
          
          if (phoneNumber && phoneNumber.length > 5) {
            setTimeout(async () => {
              try {
                const code = await sock.requestPairingCode(phoneNumber);
                session.pairingCode = code;
                session.status = 'pairing';
                logger.info({ botId, code }, 'Code d\'appairage généré');
              } catch (err) {
                logger.error({ err, botId }, 'Erreur requestPairingCode');
                session.status = 'qr';
              }
            }, 3000);
          } else {
            session.status = 'qr';
          }
        } catch (e) {
          session.status = 'qr';
        }
      }
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        session.qr = await QRCode.toDataURL(qr);
        // Ne passer en mode QR que si on n'est pas déjà en mode Pairing
        if (session.status !== 'pairing') {
          session.status = 'qr';
        }
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        session.status = 'disconnected';
        
        if (shouldReconnect) {
          SessionManager.startSession(botId);
        } else {
          const bot = BotModel.findById(botId);
          if (bot) {
            NotificationModel.create(bot.userId, 'Bot Déconnecté', `Le bot "${bot.name}" a été déconnecté.`, 'warning');
          }
          activeSessions.delete(botId);
          BotModel.updateStatus(botId, 'stopped');
          await fs.remove(sessionDir);
        }
      } else if (connection === 'open') {
        session.status = 'connected';
        session.qr = undefined;
        session.pairingCode = undefined;
        BotModel.updateStatus(botId, 'running');
        const bot = BotModel.findById(botId);
        if (bot) {
          NotificationModel.create(bot.userId, 'Bot Connecté', `Votre bot "${bot.name}" est maintenant opérationnel.`, 'success');
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

  getSessionInfo: (botId: number) => {
    const session = activeSessions.get(botId);
    if (!session) return { status: 'stopped' };
    return {
      status: session.status,
      qrDataUrl: session.qr,
      pairingCode: session.pairingCode
    };
  },

  // Alias pour compatibilité descendante si nécessaire
  getSessionStatus: (botId: number) => {
    return SessionManager.getSessionInfo(botId);
  }
};
