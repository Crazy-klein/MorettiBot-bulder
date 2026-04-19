import { WASocket, proto } from '@whiskeysockets/baileys';
import { messageStyler } from '../lib/messageStyler.js';

export const aiCommand = async (sock: WASocket, remoteJid: string, text: string) => {
  if (!text) return sock.sendMessage(remoteJid, { text: messageStyler.formatMessage('AI', 'Veuillez poser une question.') });
  
  await sock.sendMessage(remoteJid, { text: messageStyler.formatMessage('AI', 'Je réfléchis...', 'Kurona Intelligence') });
  
  // Simulation de réponse Gemini
  setTimeout(async () => {
    await sock.sendMessage(remoteJid, { 
      text: messageStyler.formatMessage('AI', [
        `Question: ${text}`,
        '',
        'Réponse: Je suis le modèle Kurona AI. Comment puis-je vous aider aujourd\'hui ?'
      ]) 
    });
  }, 2000);
};
