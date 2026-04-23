import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase<string[]>('forbidden_words.json');

export const command = {
  name: 'antword',
  aliases: ['forbidden'],
  description: 'Gère les mots interdits',
  category: 'Security',
  async execute(ctx: CommandContext) {
    if (!ctx.isGroup) return;
    if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) {
      return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Admin requis.') });
    }

    const action = ctx.args[0]?.toLowerCase(); // add, del, list
    const word = ctx.args[1]?.toLowerCase();
    const words = db.get(ctx.remoteJid) || [];

    if (action === 'add' && word) {
      if (!words.includes(word)) {
        words.push(word);
        db.set(ctx.remoteJid, words);
      }
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Sécurité', `✅ Mot "${word}" ajouté à la liste noire.`) });
    } else if (action === 'del' && word) {
      const filtered = words.filter(w => w !== word);
      db.set(ctx.remoteJid, filtered);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Sécurité', `🗑️ Mot "${word}" supprimé.`) });
    } else if (action === 'list') {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Liste Noire', words.length ? words.join(', ') : 'Aucun mot interdit.') });
    } else {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.antword <add/del/list> [mot]') });
    }
  }
};
