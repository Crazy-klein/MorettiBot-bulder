import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase('autovu.json');

export const command = {
  name: 'autovu',
  aliases: ['asv'],
  description: 'Auto-vue des statuts',
  category: 'Automation',
  async execute(ctx: CommandContext) {
    if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

    const action = ctx.args[0]?.toLowerCase();
    if (action === 'on') {
      db.set('enabled', true);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Automation', '✅ Auto-vision des statuts active.') });
    } else if (action === 'off') {
      db.delete('enabled');
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Automation', '❌ Auto-vision des statuts désactivée.') });
    } else {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.autovu <on/off>') });
    }
  }
};
