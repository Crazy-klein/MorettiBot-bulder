import { CommandContext } from '../../types/index.js';
import { formatMessage, JSONDatabase, permissions } from '../../lib/utils.js';

const db = new JSONDatabase('antitransfer.json');

export default {
    name: 'antitransfer',
    aliases: ['at'],
    description: 'Empêche les transferts de messages dans le groupe',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        const action = ctx.args[0]?.toLowerCase();
        if (action === 'on') {
            db.set(ctx.remoteJid, true);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Security', '🛡️ Anti-Transfert activé.') });
        } else if (action === 'off') {
            db.delete(ctx.remoteJid);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Security', '🔓 Anti-Transfert désactivé.') });
        } else {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .antitransfer <on/off>' });
        }
    }
};
