import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions } from '../../lib/utils.js';

export default {
    name: 'groupinfo',
    aliases: ['gcinfo', 'infogp'],
    description: 'Affiche les informations détaillées du groupe',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;

        try {
            const metadata = await ctx.sock.groupMetadata(ctx.remoteJid);
            const admins = metadata.participants.filter(p => p.admin).length;
            const creation = new Date(metadata.creation! * 1000).toLocaleDateString('fr-FR');

            const info = [
                `📌 Nom : ${metadata.subject}`,
                `🆔 ID : ${metadata.id}`,
                `👥 Membres : ${metadata.participants.length}`,
                `🛡️ Admins : ${admins}`,
                `📅 Création : ${creation}`,
                `✍️ Desc : ${metadata.desc?.toString().slice(0, 100) || 'Aucune'}`
            ];

            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Group Meta', info) 
            });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de récupération des données.' });
        }
    }
};
