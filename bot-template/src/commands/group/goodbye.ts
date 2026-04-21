import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export default {
    name: 'goodbye',
    aliases: ['bye', 'au-revoir'],
    description: 'Configure le message de départ des membres',
    category: 'Group',
    async execute(ctx: CommandContext) {
        const sub = ctx.args[0]?.toLowerCase();
        if (sub === 'on') {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Goodbye', '✅ Messages de départ activés.') });
        } else if (sub === 'set') {
            const text = ctx.args.slice(1).join(' ');
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Goodbye', `📝 Nouveau message défini :\n"${text}"`) });
        } else {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Usage: .goodbye <on/off/set message>' });
        }
    }
};
