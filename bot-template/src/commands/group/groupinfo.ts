import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export default {
    name: 'groupinfo',
    aliases: ['ginfo', 'infogp'],
    description: 'Affiche les détails du groupe',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;

        try {
            const metadata = await ctx.sock.groupMetadata(ctx.remoteJid);
            const admins = metadata.participants.filter(p => p.admin !== null).length;
            
            const info = [
                `📌 Nom: ${metadata.subject}`,
                `🆔 ID: ${metadata.id}`,
                `👥 Membres: ${metadata.participants.length}`,
                `🛡️ Admins: ${admins}`,
                `👤 Créateur: @${(metadata.owner || 'Inconnu').split('@')[0]}`,
                `📝 Description: ${metadata.desc || 'Aucune'}`
            ];

            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Infos Groupe', info),
                mentions: metadata.owner ? [metadata.owner] : []
            });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de récupération.' });
        }
    }
};
