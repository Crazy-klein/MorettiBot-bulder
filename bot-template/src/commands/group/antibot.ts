import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export default {
    name: 'antibot',
    description: 'Active/Désactive la protection anti-bot',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        const isUserAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender);
        if (!isUserAdmin) return;

        // Logique de bascule (simplifiée pour le template)
        const text = formatMessage('Anti-Bot', 'La protection anti-bot a été mise à jour pour ce groupe.');
        await ctx.sock.sendMessage(ctx.remoteJid, { text });
    }
};
