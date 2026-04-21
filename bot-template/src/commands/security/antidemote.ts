import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export default {
    name: 'antidemote',
    aliases: ['adm', 'nopromote'],
    description: 'Empêche la destitution forcée des administrateurs',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        const action = ctx.args[0]?.toLowerCase();
        if (action === 'on') {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Demote', '🛡️ Protection active. Toute destitution d\'admin sera annulée.') });
        } else {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Demote', '🔓 Protection désactivée.') });
        }
    }
};
