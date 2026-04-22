import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';

export default {
    name: 'ping',
    aliases: ['pong'],
    description: 'Vérifie la latence du bot',
    category: 'General',
    async execute(ctx: CommandContext) {
        const start = Date.now();
        await ctx.sock.sendMessage(ctx.remoteJid, { text: '🏓 *Pong...*' });
        const latency = Date.now() - start;

        await ctx.sock.sendMessage(ctx.remoteJid, { 
            text: formatMessage('Bot Status', `Latence: ${latency}ms`) 
        });
    }
};
