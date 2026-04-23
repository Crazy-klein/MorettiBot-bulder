import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase('antivideo.json');

export const command = {
  name: 'antivideo',
  aliases: ['antivid'],
  description: 'Bloque les vidéos dans le groupe',
  category: 'Security',
  async execute(ctx: CommandContext) {
    if (!ctx.isGroup) return;
    if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) {
      return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Admin requis.') });
    }

    const action = ctx.args[0]?.toLowerCase();
    if (action === 'on') {
      db.set(ctx.remoteJid, true);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Sécurité', '🛡️ Anti-Vidéo activé.') });
    } else if (action === 'off') {
      db.delete(ctx.remoteJid);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Sécurité', '🔓 Anti-Vidéo désactivé.') });
    } else {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.antivideo <on/off>') });
    }
  }
};
