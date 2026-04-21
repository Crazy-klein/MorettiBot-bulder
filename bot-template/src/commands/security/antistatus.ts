import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export default {
    name: 'antistatus',
    aliases: ['asstatut', 'nostatus'],
    description: 'Empêche l\'envoi de messages de type status dans le groupe',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        const action = ctx.args[0]?.toLowerCase() === 'on' ? 'activé' : 'désactivé';
        await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Status', `Le filtre anti-status a été ${action}.`) });
    }
};
