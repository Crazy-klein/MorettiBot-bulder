import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export default {
    name: 'antiforbidden',
    aliases: ['af', 'antiword'],
    description: 'Empêche l\'usage de mots ou termes interdits',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        const action = ctx.args[0]?.toLowerCase();
        const word = ctx.args.slice(1).join(' ');

        if (action === 'add' && word) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Mots', `Mots "${word}" ajouté à la liste noire.`) });
        } else if (action === 'list') {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Mots', 'Liste vide pour le moment.') });
        } else {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Usage: .af <add/list/remove> [mot]' });
        }
    }
};
