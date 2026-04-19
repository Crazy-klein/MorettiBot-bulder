import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion 
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import { config } from './config.js';

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  const { version } = await fetchLatestBaileysVersion();

  console.log(`--- Démarrage de ${config.name} (Type: ${config.type}) ---`);

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: 'silent' }) as any,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log('Scannez le code QR ci-dessous :');
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === 'open') {
      console.log(`${config.name} est connecté !`);
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    if (!body.startsWith(config.prefix)) return;

    const command = body.slice(config.prefix.length).trim().split(' ').shift()?.toLowerCase();
    
    if (command === 'ping') {
      await sock.sendMessage(msg.key.remoteJid!, { text: 'Pong! 🏓' });
    }

    if (command === 'status') {
      await sock.sendMessage(msg.key.remoteJid!, { 
        text: `*SYSTEM STATUS*\n\nBot: ${config.name}\nModules: ${config.enabledModules.join(', ')}\nVersion: ${config.version}` 
      });
    }
  });
}

startBot();
