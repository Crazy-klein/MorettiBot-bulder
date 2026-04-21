import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export default {
    name: 'antidelete',
    aliases: ['ad', 'norevoke'],
    description: 'Empêche la suppression de messages (Détection et renvoi)',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        const isUserAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender);
        if (!isUserAdmin) return;

        const state = ctx.args[0]?.toLowerCase() === 'on';
        await ctx.sock.sendMessage(ctx.remoteJid, { 
            text: formatMessage('Anti-Delete', `La protection contre la suppression est désormais ${state ? '*Activée*' : '*Désactivée*'}.`) 
        });
    }
};
