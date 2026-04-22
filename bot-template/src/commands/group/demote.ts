import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions } from '../../lib/utils.js';

export default {
    name: 'demote',
    aliases: ['unadmin', 'destituer'],
    description: 'Retire les droits administrateur d\'un membre',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;

        const isUserAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender);
        if (!isUserAdmin) return;

        const target = ctx.mentionedJid[0] || (ctx.quotedMessage ? (ctx.msg.message as any)?.extendedTextMessage?.contextInfo?.participant : null);

        if (!target) return;

        try {
            await ctx.sock.groupParticipantsUpdate(ctx.remoteJid, [target], 'demote');
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Demote', `@${target.split('@')[0]} n'est plus administrateur.`),
                mentions: [target]
            });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur lors de la rétrogradation.' });
        }
    }
};
