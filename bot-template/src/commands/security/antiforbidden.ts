import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase<string[]>('forbidden_words.json');

export default {
    name: 'antiforbidden',
    aliases: ['af', 'antiword'],
    description: 'Empêche l\'usage de mots ou termes interdits',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        const action = ctx.args[0]?.toLowerCase();
        const word = ctx.args.slice(1).join(' ')?.toLowerCase();
        const forbidden = db.get(ctx.remoteJid) || [];

        if (action === 'add' && word) {
            forbidden.push(word);
            db.set(ctx.remoteJid, forbidden);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Mots', `Le mot "${word}" a été banni.`) });
        } else if (action === 'list') {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Mots', forbidden.length ? forbidden.join(', ') : 'Aucun mot banni.') });
        } else if (action === 'remove' && word) {
            const filtered = forbidden.filter(w => w !== word);
            db.set(ctx.remoteJid, filtered);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Mots', `Le mot "${word}" a été retiré.`) });
        } else {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Usage: .af <add/list/remove> [mot]' });
        }
    }
};
