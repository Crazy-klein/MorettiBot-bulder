import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions } from '../../lib/utils.js';

export default {
    name: 'setname',
    aliases: ['setsubject'],
    description: 'Change le nom du groupe',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🚫 Admin requis.' });

        const text = ctx.args.join(' ');
        if (!text) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .setname <nouveau nom>' });

        try {
            await ctx.sock.groupUpdateSubject(ctx.remoteJid, text);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Groupe', `✅ Nom mis à jour : ${text}`) });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de modification.' });
        }
    }
};
