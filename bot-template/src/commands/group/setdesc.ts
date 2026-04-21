import { CommandContext } from '../../types/index.js';
import { permissions } from '../../lib/utils.js';

export default {
    name: 'setdesc',
    aliases: ['setdescription'],
    description: 'Change la description du groupe',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;

        const isUserAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender);
        if (!isUserAdmin) return;

        const text = ctx.args.join(' ');
        if (!text) return await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Veuillez fournir un texte.' });

        try {
            await ctx.sock.groupUpdateDescription(ctx.remoteJid, text);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '✅ Description mise à jour.' });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur lors de la mise à jour.' });
        }
    }
};
