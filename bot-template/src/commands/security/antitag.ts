import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export default {
    name: 'antitag',
    aliases: ['at', 'notag'],
    description: 'Empêche les mentions massives ou abusives',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        const limit = parseInt(ctx.args[0]) || 5;
        await ctx.sock.sendMessage(ctx.remoteJid, { 
            text: formatMessage('Anti-Tag', `Limite de mentions réglée à *${limit}* par message.`) 
        });
    }
};
