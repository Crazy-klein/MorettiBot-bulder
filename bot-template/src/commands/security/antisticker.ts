import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export default {
    name: 'antisticker',
    aliases: ['as', 'nosticker'],
    description: 'Empêche l\'envoi massif de stickers',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        const action = ctx.args[0]?.toLowerCase() === 'on';
        await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Sticker', `La restriction sticker est ${action ? 'ACTIVE' : 'INACTIVE'}.`) });
    }
};
