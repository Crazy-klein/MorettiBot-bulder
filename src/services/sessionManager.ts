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
  uptime: number; // Date de début
  lastMessageAt: Date | null;
  connectionAttempts: number;
  timer?: NodeJS.Timeout;
}

const activeSessions: Map<number, Session> = new Map();

// Job de nettoyage et monitoring toutes les 30s
setInterval(() => {
  activeSessions.forEach(async (session, botId) => {
    // 1. Cleanup timeout inactivité (5 min sans connexion)
    if (['connecting', 'qr', 'pairing'].includes(session.status)) {
      const elapsed = Date.now() - session.uptime;
      if (elapsed > 5 * 60 * 1000) {
        logger.warn({ botId }, 'Session timeout (inactivité pré-connexion)');
        SessionManager.stopSession(botId);
        NotificationModel.create(0, 'Session expirée', 'La demande de connexion a expiré après 5 minutes d\'inactivité.');
      }
    }
    
    // 2. Monitoring état socket
    try {
      if (session.status === 'connected' && !session.socket.ws.isOpen) {
        logger.info({ botId }, 'Tentative de reconnexion automatique...');
        session.connectionAttempts++;
        if (session.connectionAttempts > 3) {
          SessionManager.stopSession(botId);
        }
      }
    } catch (e) {}
  });
}, 30000);

export const SessionManager = {
  startSession: async (botId: number) => {
    // Nettoyer si déjà existant
    if (activeSessions.has(botId)) {
      await SessionManager.stopSession(botId);
    }

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

    const session: Session = { 
      socket: sock, 
      status: 'connecting',
      uptime: Date.now(),
      lastMessageAt: null,
      connectionAttempts: 0
    };
    activeSessions.set(botId, session);

    // Gérer le code d'appairage si pas encore enregistré
    if (!sock.authState.creds.registered) {
      const bot = BotModel.findById(botId);
      if (bot) {
        try {
          const configString = bot.config;
          const config = JSON.parse(configString);
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

    sock.ev.on('messages.upsert', () => {
      session.lastMessageAt = new Date();
    });

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        session.qr = await QRCode.toDataURL(qr);
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
          SessionManager.stopSession(botId);
        }
      } else if (connection === 'open') {
        session.status = 'connected';
        session.qr = undefined;
        session.pairingCode = undefined;
        session.connectionAttempts = 0;
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
        await session.socket.end(); // Fermeture propre
      } catch (e) {}
      activeSessions.delete(botId);
    }
    const sessionDir = path.resolve(__dirname, `../../sessions/bot_${botId}`);
    await fs.remove(sessionDir);
    BotModel.updateStatus(botId, 'stopped');
    logger.info({ botId }, 'Session arrêtée proprement et fichiers nettoyés');
  },

  getSessionInfo: (botId: number) => {
    const session = activeSessions.get(botId);
    if (!session) return { status: 'stopped' };
    return {
      status: session.status,
      qrDataUrl: session.qr,
      pairingCode: session.pairingCode,
      uptimeSeconds: Math.floor((Date.now() - session.uptime) / 1000),
      lastMessageAt: session.lastMessageAt,
      connectionAttempts: session.connectionAttempts
    };
  },

  // Récupérer tous les statuts pour le monitoring dashboard si besoin
  getAllSessions: () => Array.from(activeSessions.entries()).map(([id, s]) => ({ id, status: s.status })),

  getSessionStatus: (botId: number) => {
    return SessionManager.getSessionInfo(botId);
  }
};
