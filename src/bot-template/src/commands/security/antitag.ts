import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase('antitag.json');

export const command = {
  name: 'antitag',
  aliases: ['at'],
  description: 'Limite le nombre de tags par message',
  category: 'Security',
  async execute(ctx: CommandContext) {
    if (!ctx.isGroup) return;
    if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) {
      return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Admin requis.') });
    }

    const limit = parseInt(ctx.args[0]);
    if (!isNaN(limit)) {
      db.set(ctx.remoteJid, limit);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Sécurité', `🛡️ Limite de tags fixée à ${limit}.`) });
    } else if (ctx.args[0] === 'off') {
      db.delete(ctx.remoteJid);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Sécurité', '🔓 Anti-Tag désactivé.') });
    } else {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.antitag <nombre/off>') });
    }
  }
};
