import { proto, WASocket } from '@whiskeysockets/baileys';
import { config } from '../config.js';
import { messageStyler } from '../lib/messageStyler.js';
import { aiCommand } from '../commands/ai.js';
import { downloaderCommand } from '../commands/downloader.js';

export const handleMessage = async (sock: WASocket, m: { messages: proto.IWebMessageInfo[], type: string }) => {
  const msg = m.messages[0];
  if (!msg.message || msg.key.fromMe) return;

  const remoteJid = msg.key.remoteJid!;
  const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
  
  if (!body.startsWith(config.prefix)) return;

  const args = body.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();
  const text = args.join(' ');

  // Dispatcher
  switch (command) {
    case 'ping':
      await sock.sendMessage(remoteJid, { 
        text: messageStyler.formatMessage('System', 'Pong! 🏓', `Latence: ${Date.now() - (msg.messageTimestamp as number * 1000)}ms`) 
      });
      break;

    case 'help':
    case 'menu':
      const modules = Object.entries(config.enabledModules)
        .filter(([_, enabled]) => (enabled as any === true || enabled as any === "true"))
        .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));
      
      await sock.sendMessage(remoteJid, { 
        text: messageStyler.formatMessage('Menu', [
          `Bienvenue sur ${config.name}`,
          `Modules actifs: ${modules.join(', ')}`,
          '',
          'Commandes:',
          '• .ping - Test de latence',
          '• .status - État du bot',
          config.enabledModules.ai ? '• .ai [query] - Intelligence Artificielle' : '',
          config.enabledModules.downloader ? '• .fb [url] - Téléchargeur Vidéo' : '',
          config.enabledModules.group ? '• .kick @user - Modération' : ''
        ].filter(Boolean), `Préfixe: ${config.prefix}`) 
      });
      break;

    case 'status':
      await sock.sendMessage(remoteJid, { 
        text: messageStyler.formatMessage('Status', [
          `Nom: ${config.name}`,
          `Version: ${config.version}`,
          `Propriétaire: ${config.ownerName}`,
          `Type: ${config.type}`
        ]) 
      });
      break;

    case 'ai':
      if (config.enabledModules.ai) await aiCommand(sock, remoteJid, text);
      break;

    case 'dl':
    case 'fb':
      if (config.enabledModules.downloader) await downloaderCommand(sock, remoteJid, text);
      break;

    default:
      break;
  }
};
