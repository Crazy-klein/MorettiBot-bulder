import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions } from '../../lib/utils.js';

export default {
    name: 'setdesc',
    aliases: ['setdescription'],
    description: 'Change la description du groupe',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🚫 Admin requis.' });

        const text = ctx.args.join(' ');
        if (!text) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .setdesc <nouvelle description>' });

        try {
            await ctx.sock.groupUpdateDescription(ctx.remoteJid, text);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Groupe', '✅ Description mise à jour avec succès.') });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de modification.' });
        }
    }
};
