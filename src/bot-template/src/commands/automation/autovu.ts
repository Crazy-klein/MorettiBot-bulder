import { CommandContext } from '../../types/index.js';
import { formatMessage, JSONDatabase, permissions } from '../../lib/utils.js';

const db = new JSONDatabase('autovu.json');

export default {
    name: 'autovu',
    aliases: ['autostatus'],
    description: 'Active la vision automatique des statuts',
    category: 'Automation',
    async execute(ctx: CommandContext) {
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        const action = ctx.args[0]?.toLowerCase();
        if (action === 'on') {
            db.set('global_enabled', true);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Automation', '👀 Auto-vision des statuts activée globalement.') });
        } else if (action === 'off') {
            db.delete('global_enabled');
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Automation', '❌ Auto-vision des statuts désactivée.') });
        } else {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .autovu <on/off>' });
        }
    }
};
