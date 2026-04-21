import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export default {
    name: 'autoreact',
    aliases: ['autors', 'reactauto'],
    description: 'Gère les réactions automatiques sur les messages',
    category: 'Automation',
    async execute(ctx: CommandContext) {
        const sub = ctx.args[0]?.toLowerCase();
        if (sub === 'on') {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Auto-React', '✅ Activé pour ce groupe.') });
        } else if (sub === 'off') {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Auto-React', '❌ Désactivé.') });
        } else {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Usage: .autoreact <on/off>' });
        }
    }
};
