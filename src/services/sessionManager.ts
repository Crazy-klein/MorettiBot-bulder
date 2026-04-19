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
      logger: pino({ level: 'silent' }) as any,
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
        console.log('Connexion fermée due à ', lastDisconnect?.error, ', reconnexion ', shouldReconnect);
        
        if (shouldReconnect) {
          SessionManager.startSession(botId);
        } else {
          activeSessions.delete(botId);
          BotModel.updateStatus(botId, 'stopped');
          await fs.remove(sessionDir);
        }
      } else if (connection === 'open') {
        console.log('Connexion ouverte !');
        session.status = 'connected';
        session.qr = undefined;
        BotModel.updateStatus(botId, 'running');
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
