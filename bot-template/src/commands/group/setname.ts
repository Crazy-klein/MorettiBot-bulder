import { CommandContext } from '../../types/index.js';
import { permissions } from '../../lib/utils.js';

export default {
    name: 'setname',
    aliases: ['setsubject'],
    description: 'Change le nom du groupe',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;

        const isUserAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender);
        if (!isUserAdmin) return;

        const text = ctx.args.join(' ');
        if (!text) return await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Veuillez fournir un nom.' });

        try {
            await ctx.sock.groupUpdateSubject(ctx.remoteJid, text);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '✅ Nom du groupe mis à jour.' });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur lors de la mise à jour.' });
        }
    }
};
