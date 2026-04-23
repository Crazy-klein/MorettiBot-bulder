import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase('antispam.json');

export const command = {
  name: 'antispam',
  aliases: ['as'],
  description: 'Active/Désactive la protection anti-spam',
  category: 'Security',
  async execute(ctx: CommandContext) {
    if (!ctx.isGroup) return;
    if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) {
      return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Admin requis.') });
    }

    const action = ctx.args[0]?.toLowerCase();
    if (action === 'on') {
      db.set(ctx.remoteJid, true);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Sécurité', '🛡️ Anti-Spam activé.') });
    } else if (action === 'off') {
      db.delete(ctx.remoteJid);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Sécurité', '🔓 Anti-Spam désactivé.') });
    } else {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.antispam <on/off>') });
    }
  }
};
