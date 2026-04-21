import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export default {
    name: 'groupinfo',
    aliases: ['ginfo', 'infogroupe'],
    description: 'Affiche les informations détaillés du groupe actuel',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;

        try {
            const metadata = await ctx.sock.groupMetadata(ctx.remoteJid);
            const owner = metadata.owner || metadata.participants.find(p => p.admin === 'superadmin')?.id || 'Inconnu';
            const creationDate = new Date((metadata.creation || 0) * 1000).toLocaleDateString('fr-FR');

            const info = [
                `📌 *Nom:* ${metadata.subject}`,
                `🆔 *ID:* ${metadata.id}`,
                `👑 *Propriétaire:* @${owner.split('@')[0]}`,
                `📅 *Créé le:* ${creationDate}`,
                `👥 *Membres:* ${metadata.participants.length}`,
                `📝 *Description:* ${metadata.desc?.toString() || 'Aucune'}`
            ];

            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Group Info', info),
                mentions: [owner]
            });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Impossible de récupérer les infos du groupe.' });
        }
    }
};
