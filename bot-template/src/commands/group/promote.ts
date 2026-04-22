import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions } from '../../lib/utils.js';

export default {
    name: 'promote',
    aliases: ['admin', 'promouvoir'],
    description: 'Donne les droits administrateur à un membre',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;

        const isUserAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender);
        if (!isUserAdmin) return;

        const target = ctx.mentionedJid[0] || (ctx.quotedMessage ? (ctx.msg.message as any)?.extendedTextMessage?.contextInfo?.participant : null);

        if (!target) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Promote', 'Mentionnez l\'utilisateur à promouvoir.') 
            });
        }

        try {
            await ctx.sock.groupParticipantsUpdate(ctx.remoteJid, [target], 'promote');
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Succès', `@${target.split('@')[0]} est désormais administrateur.`),
                mentions: [target]
            });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur lors de la promotion.' });
        }
    }
};
