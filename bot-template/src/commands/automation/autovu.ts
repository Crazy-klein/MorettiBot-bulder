import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export default {
    name: 'autovu',
    aliases: ['autovustatut', 'readstatus'],
    description: 'Visionne automatiquement les statuts et peut envoyer des likes',
    category: 'Automation',
    async execute(ctx: CommandContext) {
        const sub = ctx.args[0]?.toLowerCase();
        if (sub === 'on') {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Auto-Vu', '✅ Visionnage automatique actif.') });
        } else if (sub === 'like') {
            const state = ctx.args[1] === 'on' ? 'Activé' : 'Désactivé';
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Auto-Vu', `💖 Like automatique : ${state}`) });
        } else {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Usage: .autovu <on/off/like on/like off>' });
        }
    }
};
