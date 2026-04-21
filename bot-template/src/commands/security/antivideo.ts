import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export default {
    name: 'antivideo',
    aliases: ['av', 'novideo'],
    description: 'Empêche l\'envoi de vidéos dans le groupe',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        const state = ctx.args[0]?.toLowerCase() === 'on';
        await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Vidéo', `Le blocage des vidéos est ${state ? 'ACTIF' : 'INACTIF'}.`) });
    }
};
