import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { mediaUtils } from '../../lib/utils.js';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

export const command = {
  name: 'vv',
  aliases: ['viewonce', 'reveler'],
  description: 'Bypass vue unique',
  category: 'Tools',
  async execute(ctx: CommandContext) {
    const quoted = ctx.quotedMessage;
    if (!quoted) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', 'Répondez à un message à vue unique.') });

    const viewOnceMessage = quoted.viewOnceMessageV2 || quoted.viewOnceMessageV2Extension || quoted.viewOnceMessage;
    if (!viewOnceMessage) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Ce message n\'est pas à vue unique.') });

    try {
      const info = viewOnceMessage.message;
      const type = Object.keys(info || {}).find(k => k.endsWith('Message'));
      if (!type) throw new Error();

      const buffer = await downloadMediaMessage({ message: info } as any, 'buffer', {});
      
      if (type === 'imageMessage') {
        await ctx.sock.sendMessage(ctx.remoteJid, { image: buffer, caption: formatMessage('Révélation', '🔓 Image à vue unique récupérée.') });
      } else if (type === 'videoMessage') {
        await ctx.sock.sendMessage(ctx.remoteJid, { video: buffer, caption: formatMessage('Révélation', '🔓 Vidéo à vue unique récupérée.') });
      }
    } catch {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Échec de la récupération du média.') });
    }
  }
};
