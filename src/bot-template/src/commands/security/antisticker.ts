import { CommandContext } from '../../types/index.js';
import { formatMessage, JSONDatabase, permissions } from '../../lib/utils.js';

const db = new JSONDatabase('antisticker.json');

export default {
    name: 'antisticker',
    aliases: ['astk'],
    description: 'Empêche l\'envoi de stickers dans le groupe',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        const action = ctx.args[0]?.toLowerCase();
        if (action === 'on') {
            db.set(ctx.remoteJid, true);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Security', '🛡️ Anti-Sticker activé.') });
        } else if (action === 'off') {
            db.delete(ctx.remoteJid);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Security', '🔓 Anti-Sticker désactivé.') });
        } else {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .antisticker <on/off>' });
        }
    }
};
