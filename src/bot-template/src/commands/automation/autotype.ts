import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase('autotype.json');

export const command = {
  name: 'autotype',
  aliases: ['asmode'],
  description: 'Simulation d\'écriture',
  category: 'Automation',
  async execute(ctx: CommandContext) {
    if (!ctx.isGroup) return;
    if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

    const action = ctx.args[0]?.toLowerCase();
    if (['typing', 'recording'].includes(action)) {
      db.set(ctx.remoteJid, action);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Automation', `✅ Mode ${action} activé.`) });
    } else if (action === 'off') {
      db.delete(ctx.remoteJid);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Automation', '❌ Simulation désactivée.') });
    } else {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.autotype <typing/recording/off>') });
    }
  }
};
