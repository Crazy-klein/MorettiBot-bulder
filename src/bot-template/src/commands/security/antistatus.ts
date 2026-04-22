import { CommandContext } from '../../types/index.js';
import { formatMessage, JSONDatabase, permissions } from '../../lib/utils.js';

const db = new JSONDatabase('antistatus.json');

export default {
    name: 'antistatus',
    aliases: ['as'],
    description: 'Empêche l\'affichage de certains types de statuts',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        const action = ctx.args[0]?.toLowerCase();
        if (action === 'on') {
            db.set(ctx.remoteJid, true);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Security', '🛡️ Anti-Status activé.') });
        } else if (action === 'off') {
            db.delete(ctx.remoteJid);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Security', '🔓 Anti-Status désactivé.') });
        } else {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .antistatus <on/off>' });
        }
    }
};
