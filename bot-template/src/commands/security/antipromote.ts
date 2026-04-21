import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export default {
    name: 'antipromote',
    aliases: ['antiprom'],
    description: 'Empêche la promotion de nouveaux administrateurs sans autorisation',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        const sub = ctx.args[0]?.toLowerCase();
        if (sub === 'on') {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Promote', '✅ Activé. Toute promotion sera automatiquement annulée.') });
        } else if (sub === 'off') {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Promote', '❌ Désactivé.') });
        } else {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Usage: .antipromote <on/off>' });
        }
    }
};
