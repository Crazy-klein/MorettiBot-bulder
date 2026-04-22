import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase<string[]>('forbidden_words.json');

export default {
    name: 'antword',
    aliases: ['aw', 'forbidden'],
    description: 'Banni des mots spécifiques du groupe',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🚫 Admin requis.' });

        const sub = ctx.args[0]?.toLowerCase();
        const words = db.get(ctx.remoteJid) || [];

        if (sub === 'add') {
            const word = ctx.args[1]?.toLowerCase();
            if (!word) return;
            if (!words.includes(word)) {
                words.push(word);
                db.set(ctx.remoteJid, words);
            }
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Word', `✅ Mot "${word}" ajouté.`) });
        } else if (sub === 'del') {
            const word = ctx.args[1]?.toLowerCase();
            const index = words.indexOf(word);
            if (index > -1) {
                words.splice(index, 1);
                db.set(ctx.remoteJid, words);
            }
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Word', `✅ Mot "${word}" supprimé.`) });
        } else if (sub === 'list') {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Forbidden Words', words.length ? words.join(', ') : 'Aucun mot banni.') });
        }

        await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .antword <add/del/list> [mot]' });
    }
};
