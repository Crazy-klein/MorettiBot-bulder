import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase<Record<string, string>>('responder.json');

export const command = {
  name: 'responder',
  aliases: ['ar'],
  description: 'FAQ automatique',
  category: 'Automation',
  async execute(ctx: CommandContext) {
    if (!ctx.isGroup) return;
    if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

    const action = ctx.args[0]?.toLowerCase();
    const key = ctx.args[1]?.toLowerCase();
    const response = ctx.args.slice(2).join(' ');

    const data = db.get(ctx.remoteJid) || {};

    if (action === 'add' && key && response) {
      data[key] = response;
      db.set(ctx.remoteJid, data);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Automation', `✅ Réponse enregistrée pour "${key}".`) });
    } else if (action === 'del' && key) {
      delete data[key];
      db.set(ctx.remoteJid, data);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Automation', `🗑️ Déclencheur "${key}" supprimé.`) });
    } else if (action === 'list') {
      const keys = Object.keys(data);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Auto-Responder', keys.length ? keys.join(', ') : 'Aucune réponse configurée.') });
    } else {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.responder <add/del/list> [mot] [réponse]') });
    }
  }
};
