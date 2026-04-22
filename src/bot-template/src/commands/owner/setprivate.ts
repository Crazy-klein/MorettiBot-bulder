import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, botStatus } from '../../lib/utils.js';
import { config } from '../../config.js';

export default {
    name: 'setprivate',
    aliases: ['private'],
    description: 'Active le mode privé (seul l\'owner peut utiliser le bot)',
    category: 'Owner',
    async execute(ctx: CommandContext) {
        if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;
        
        botStatus.setPublic(false);
        await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🔒', key: ctx.msg.key } });
        await ctx.sock.sendMessage(ctx.remoteJid, { 
            text: formatMessage('Mode Système', '✅ Le bot est désormais en mode *PRIVÉ*.\nSeul le créateur peut interagir avec moi.') 
        });
    }
};
