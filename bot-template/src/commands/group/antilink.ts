import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export default {
    name: 'antilink',
    description: 'Active/Désactive la suppression automatique des liens',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        const isUserAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender);
        if (!isUserAdmin) return;

        const text = formatMessage('Anti-Link', 'Le mode anti-lien est désormais configuré pour ce groupe.');
        await ctx.sock.sendMessage(ctx.remoteJid, { text });
    }
};
