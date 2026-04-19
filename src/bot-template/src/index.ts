import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion,
  WASocket
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import { config } from './config.js';
import { handleMessage } from './handlers/messageHandler.js';

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  const { version } = await fetchLatestBaileysVersion();

  console.log(`\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`);
  console.log(`┃  [KuronaBot] Initialisation de ${config.name.padEnd(16)} ┃`);
  console.log(`┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n`);

  const sock: WASocket = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false, // On gère manuellement pour le pairing code
    logger: pino({ level: 'silent' }) as any,
  });

  // Gestion du code d'appairage (Pairing Code)
  if (!sock.authState.creds.registered) {
    const phoneNumber = config.ownerNumber.replace(/[^0-9]/g, '');
    
    if (phoneNumber && phoneNumber.length > 5) {
      setTimeout(async () => {
        try {
          const code = await sock.requestPairingCode(phoneNumber);
          console.log(`\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`);
          console.log(`┃  [KuronaBot] CODE D'APPAIRAGE :        ┃`);
          console.log(`┃  > ${code.match(/.{1,4}/g)?.join('-').padEnd(25)} ┃`);
          console.log(`┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n`);
        } catch (error) {
          console.error(`[KuronaBot] Échec de la demande de code d'appairage. Basculement sur QR Code...`);
        }
      }, 3000);
    } else {
      console.log(`[KuronaBot] Aucun numéro valide pour l'appairage. Affichage du QR Code...`);
    }
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log(`[KuronaBot] Veuillez scanner le QR Code ci-dessous :`);
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(`[KuronaBot] Connexion fermée. Reconnexion : ${shouldReconnect}`);
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === 'open') {
      console.log(`\n[KuronaBot] ${config.name} est maintenant CONNECTÉ ! 🚀`);
    }
  });

  sock.ev.on('messages.upsert', (m) => handleMessage(sock, m));
}

startBot();
