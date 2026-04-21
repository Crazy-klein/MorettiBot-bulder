import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export default {
    name: 'tagadmin',
    aliases: ['admins', 'mentionadmin'],
    description: 'Mentionne tous les administrateurs du groupe',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;

        const isUserAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender);
        if (!isUserAdmin) return;

        try {
            const metadata = await ctx.sock.groupMetadata(ctx.remoteJid);
            const admins = metadata.participants.filter(p => p.admin !== null).map(p => p.id);
            const message = ctx.args.join(' ') || 'Admins, votre attention est requise !';

            let response = `⚠️ *ALERTE ADMINS*\n\n💬 ${message}\n\n`;
            admins.forEach(jid => response += `@${jid.split('@')[0]} `);

            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Appel Staff', response),
                mentions: admins
            });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur.' });
        }
    }
};
