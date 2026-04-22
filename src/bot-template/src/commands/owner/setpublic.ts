import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, botStatus } from '../../lib/utils.js';
import { config } from '../../config.js';

export default {
    name: 'setpublic',
    aliases: ['public'],
    description: 'Active le mode public (tout le monde peut utiliser le bot)',
    category: 'Owner',
    async execute(ctx: CommandContext) {
        if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;
        
        botStatus.setPublic(true);
        await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🔓', key: ctx.msg.key } });
        await ctx.sock.sendMessage(ctx.remoteJid, { 
            text: formatMessage('Mode Système', '✅ Le bot est désormais en mode *PUBLIC*.\nTous les utilisateurs peuvent interagir.') 
        });
    }
};
