import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions } from '../../lib/utils.js';

export default {
    name: 'checkadmin',
    aliases: ['isadmin', 'staff'],
    description: 'Vérifie si un utilisateur est administrateur',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;

        const target = ctx.mentionedJid[0] || (ctx.quotedMessage ? (ctx.msg.message as any)?.extendedTextMessage?.contextInfo?.participant : ctx.sender);
        
        try {
            const isAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, target);
            const status = isAdmin ? 'est un *Administrateur* 🛡️' : 'est un *Membre* 👤';
            
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Admin Check', `@${target.split('@')[0]} ${status}`),
                mentions: [target]
            });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur technique.' });
        }
    }
};
