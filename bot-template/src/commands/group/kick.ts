import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { isAdmin } from '../../lib/utils.js';

export default {
    name: 'kick',
    description: 'Expulser un membre du groupe',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Erreur', 'Cette commande est réservée aux groupes.') 
            });
        }

        const isUserAdmin = await isAdmin(ctx.sock, ctx.remoteJid, ctx.sender);
        if (!isUserAdmin) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Permissions', 'Désolé, seuls les administrateurs peuvent utiliser cette commande.') 
            });
        }

        const target = ctx.mentionedJid[0] || (ctx.quotedMessage ? ctx.msg.message?.extendedTextMessage?.contextInfo?.participant : null);

        if (!target) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Kick', 'Veuillez mentionner un utilisateur ou citer son message.') 
            });
        }

        try {
            await ctx.sock.groupParticipantsUpdate(ctx.remoteJid, [target], 'remove');
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Succès', `@${target.split('@')[0]} a été expulsé du groupe.`),
                mentions: [target]
            });
        } catch (error) {
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Erreur Kick', 'Impossible d\'expulser ce membre. Vérifiez que le bot est admin.') 
            });
        }
    }
};
