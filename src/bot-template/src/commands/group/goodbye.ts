import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase('goodbye.json');

export const command = {
  name: 'goodbye',
  aliases: ['aurevoir'],
  description: 'Configure le message de départ',
  category: 'Group',
  async execute(ctx: CommandContext) {
    if (!ctx.isGroup) return;
    if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

    const action = ctx.args[0]?.toLowerCase();
    const text = ctx.args.slice(1).join(' ');

    if (action === 'on') {
      db.set(`${ctx.remoteJid}:status`, true);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Succès', 'Message de départ activé.') });
    } else if (action === 'off') {
      db.set(`${ctx.remoteJid}:status`, false);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Succès', 'Message de départ désactivé.') });
    } else if (action === 'set' && text) {
      db.set(`${ctx.remoteJid}:text`, text);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Succès', 'Contenu du message de départ mis à jour.') });
    } else {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.goodbye <on/off/set [texte]>') });
    }
  }
};
