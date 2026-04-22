import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';

export default {
    name: 'ping',
    aliases: ['speed'],
    description: 'Vérifie la latence',
    category: 'General',
    async execute(ctx: CommandContext) {
        const start = Date.now();
        const { key } = await ctx.sock.sendMessage(ctx.remoteJid, { text: '🏓 Latence en cours...' });
        const latency = Date.now() - start;

        await ctx.sock.sendMessage(ctx.remoteJid, { 
            edit: key,
            text: formatMessage('Bot Status', `⚡ Latence : *${latency}ms*\n🟢 Système opérationnel.`)
        });
    }
};
