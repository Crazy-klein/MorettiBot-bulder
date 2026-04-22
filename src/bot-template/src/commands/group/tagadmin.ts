import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions } from '../../lib/utils.js';

export default {
    name: 'tagadmin',
    aliases: ['admins'],
    description: 'Mentionne tous les admins du groupe',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🚫 Admin requis.' });

        try {
            const metadata = await ctx.sock.groupMetadata(ctx.remoteJid);
            const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
            const msg = ctx.args.length ? ctx.args.join(' ') : 'Appel à l\'équipe administrative !';

            let tag = `🚨 *STAFF ALERT*\n\n💬 ${msg}\n\n`;
            admins.forEach(jid => tag += `• @${jid.split('@')[0]}\n`);

            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Appel Admin', tag), 
                mentions: admins 
            });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur.' });
        }
    }
};
