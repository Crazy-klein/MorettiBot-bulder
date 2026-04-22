import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions } from '../../lib/utils.js';

export default {
    name: 'kick',
    aliases: ['remove', 'expulser'],
    description: 'Expulse un membre du groupe',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;

        // Vérification admin utilisateur
        const isUserAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender);
        if (!isUserAdmin) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🚫', key: ctx.msg.key } });
        }

        // Vérification admin bot
        const isBotAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sock.user!.id);
        if (!isBotAdmin) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Erreur', 'Je dois être administrateur pour cette action.') 
            });
        }

        const target = ctx.mentionedJid[0] || (ctx.quotedMessage ? (ctx.msg.message as any)?.extendedTextMessage?.contextInfo?.participant : null);

        if (!target) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Kick', 'Veuillez mentionner un utilisateur.') 
            });
        }

        if (target === ctx.sock.user!.id) return; // Ne pas s'auto-kick

        try {
            await ctx.sock.groupParticipantsUpdate(ctx.remoteJid, [target], 'remove');
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Succès', `@${target.split('@')[0]} a été expédié.`),
                mentions: [target]
            });
        } catch (error) {
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Erreur Système', 'Échec de l\'opération.') 
            });
        }
    }
};
