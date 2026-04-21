import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export default {
    name: 'kick',
    aliases: ['remove', 'expulser'],
    description: 'Expulse un membre du groupe',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;

        // Vérification admin bot
        const isBotAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sock.user!.id);
        if (!isBotAdmin) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Erreur', 'Je dois être administrateur pour expulser des membres.') 
            });
        }

        // Vérification admin utilisateur
        const isUserAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender);
        if (!isUserAdmin) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Accès Refusé', 'Désolé, seuls les administrateurs peuvent utiliser cette commande.') 
            });
        }

        const target = ctx.mentionedJid[0] || (ctx.quotedMessage ? (ctx.msg.message as any)?.extendedTextMessage?.contextInfo?.participant : null);

        if (!target) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Kick', 'Veuillez mentionner un utilisateur ou citer son message pour l\'expulser.') 
            });
        }

        try {
            await ctx.sock.groupParticipantsUpdate(ctx.remoteJid, [target], 'remove');
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Succès', `@${target.split('@')[0]} a été retiré du groupe.`),
                mentions: [target]
            });
        } catch (error) {
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Erreur Système', 'Impossible d\'expulser ce membre. Veuillez vérifier mes permissions.') 
            });
        }
    }
};
