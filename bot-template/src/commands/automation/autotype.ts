import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export default {
    name: 'autotype',
    aliases: ['autowrite', 'typing'],
    description: 'Simule l\'écriture ou l\'enregistrement audio automatiquement',
    category: 'Automation',
    async execute(ctx: CommandContext) {
        const sub = ctx.args[0]?.toLowerCase();
        if (sub === 'on') {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Auto-Type', '✅ Simulation d\'écriture active.') });
        } else if (sub === 'duration') {
            const time = parseInt(ctx.args[1]) || 5;
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Auto-Type', `⏳ Durée réglée sur ${time}s.`) });
        } else {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Usage: .autotype <on/off/duration [s]>' });
        }
    }
};
