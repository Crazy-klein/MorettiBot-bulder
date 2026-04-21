import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export default {
    name: 'antitransfer',
    aliases: ['notransfer', 'antiforward'],
    description: 'Empêche les messages transférés dans le groupe',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        const sub = ctx.args[0]?.toLowerCase();
        if (sub === 'on') {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Transfer', '✅ Activé. Les messages transférés seront supprimés.') });
        } else if (sub === 'off') {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Transfer', '❌ Désactivé.') });
        } else {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Usage: .antitransfer <on/off>' });
        }
    }
};
