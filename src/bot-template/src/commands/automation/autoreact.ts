import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase('autoreact.json');

export const command = {
  name: 'autoreact',
  aliases: ['react'],
  description: 'Réactions automatiques',
  category: 'Automation',
  async execute(ctx: CommandContext) {
    if (!ctx.isGroup) return;
    if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

    const action = ctx.args[0]?.toLowerCase();
    if (action === 'on') {
      db.set(ctx.remoteJid, true);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Automation', '✅ Auto-réaction activée.') });
    } else if (action === 'off') {
      db.delete(ctx.remoteJid);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Automation', '❌ Auto-réaction désactivée.') });
    } else {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.autoreact <on/off>') });
    }
  }
};
