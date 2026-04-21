import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';
import { config } from '../../config.js';

export default {
    name: 'unblock',
    aliases: ['debloquer'],
    description: 'Débloque un utilisateur (Owner uniquement)',
    category: 'Owner',
    async execute(ctx: CommandContext) {
        if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;

        const target = ctx.mentionedJid[0] || (ctx.quotedMessage ? (ctx.msg.message as any)?.extendedTextMessage?.contextInfo?.participant : null);

        if (!target) return;

        try {
            await ctx.sock.updateBlockStatus(target, 'unblock');
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Sûreté', `@${target.split('@')[0]} a été débloqué.`),
                mentions: [target]
            });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur lors du déblocage.' });
        }
    }
};
