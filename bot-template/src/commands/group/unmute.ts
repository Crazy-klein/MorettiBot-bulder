import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export default {
    name: 'unmute',
    aliases: ['ouvrir', 'open'],
    description: 'Ouvre le groupe (tout le monde parle)',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;

        const isUserAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender);
        if (!isUserAdmin) return;

        try {
            await ctx.sock.groupSettingUpdate(ctx.remoteJid, 'not_announcement');
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Modération', 'Le groupe est désormais ouvert. Tous les membres peuvent envoyer des messages.') 
            });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur lors de l\'ouverture.' });
        }
    }
};
