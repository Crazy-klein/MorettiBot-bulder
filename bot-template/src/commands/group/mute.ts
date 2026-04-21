import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export default {
    name: 'mute',
    aliases: ['fermer', 'close'],
    description: 'Ferme le groupe (seuls les admins parlent)',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;

        const isUserAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender);
        if (!isUserAdmin) return;

        try {
            await ctx.sock.groupSettingUpdate(ctx.remoteJid, 'announcement');
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Modération', 'Le groupe est désormais fermé. Seuls les administrateurs peuvent envoyer des messages.') 
            });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur lors du verrouillage.' });
        }
    }
};
