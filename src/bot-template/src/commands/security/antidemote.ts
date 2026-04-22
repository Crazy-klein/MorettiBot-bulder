import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase('antidemote.json');

export default {
    name: 'antidemote',
    aliases: ['adm'],
    description: 'Empêche la destitution des administrateurs',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        const action = ctx.args[0]?.toLowerCase();
        
        if (action === 'on') {
            db.set(ctx.remoteJid, true);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Security', '🛡️ Anti-Demote activé. Aucune destitution ne sera tolérée.') });
        } else if (action === 'off') {
            db.delete(ctx.remoteJid);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Security', '🔓 Anti-Demote désactivé.') });
        } else {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .antidemote <on/off>' });
        }
    }
};
