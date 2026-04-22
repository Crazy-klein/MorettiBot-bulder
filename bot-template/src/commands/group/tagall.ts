import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions } from '../../lib/utils.js';

export default {
    name: 'tagall',
    aliases: ['everyone', 'tous', 'appel'],
    description: 'Mentionne tous les membres du groupe',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;

        const isUserAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender);
        if (!isUserAdmin) return await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🚫', key: ctx.msg.key } });

        try {
            const groupMetadata = await ctx.sock.groupMetadata(ctx.remoteJid);
            const participants = groupMetadata.participants;
            const message = ctx.args.join(' ') || 'Appel général !';

            let response = `📢 *APPEL GÉNÉRAL*\n\n💬 ${message}\n\n`;
            participants.forEach(p => {
                response += `👤 @${p.id.split('@')[0]}\n`;
            });

            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Tag All', response),
                mentions: participants.map(p => p.id)
            });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur' });
        }
    }
};
