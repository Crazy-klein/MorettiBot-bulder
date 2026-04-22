import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase('antipromote.json');

export default {
    name: 'antipromote',
    aliases: ['ap'],
    description: 'Empêche la promotion non autorisée d\'administrateurs',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        const action = ctx.args[0]?.toLowerCase();
        
        if (action === 'on') {
            db.set(ctx.remoteJid, true);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Security', '🛡️ Anti-Promote activé. Seul le bot peut promouvoir maintenant.') });
        } else if (action === 'off') {
            db.delete(ctx.remoteJid);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Security', '🔓 Anti-Promote désactivé.') });
        } else {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .antipromote <on/off>' });
        }
    }
};
