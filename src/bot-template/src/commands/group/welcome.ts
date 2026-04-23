import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase('welcome.json');

export const command = {
  name: 'welcome',
  aliases: ['bienvenue'],
  description: 'Configure le message d\'accueil',
  category: 'Group',
  async execute(ctx: CommandContext) {
    if (!ctx.isGroup) return;
    if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

    const action = ctx.args[0]?.toLowerCase();
    const text = ctx.args.slice(1).join(' ');

    if (action === 'on') {
      db.set(`${ctx.remoteJid}:status`, true);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Succès', 'Message de bienvenue activé.') });
    } else if (action === 'off') {
      db.set(`${ctx.remoteJid}:status`, false);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Succès', 'Message de bienvenue désactivé.') });
    } else if (action === 'set' && text) {
      db.set(`${ctx.remoteJid}:text`, text);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Succès', 'Contenu du message d\'accueil mis à jour.') });
    } else {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.welcome <on/off/set [texte]>') });
    }
  }
};
