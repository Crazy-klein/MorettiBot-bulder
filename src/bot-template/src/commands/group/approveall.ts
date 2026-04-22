import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions } from '../../lib/utils.js';

export default {
    name: 'approveall',
    aliases: ['approuver'],
    description: 'Approuve toutes les demandes d\'adhésion en attente.',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;

        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Droits administrateur requis.' });
        }

        try {
            const requests = await ctx.sock.groupRequestParticipantsList(ctx.remoteJid);
            if (!requests || requests.length === 0) {
                return await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Aucune demande d\'adhésion en attente.' });
            }

            const toApprove = requests.map(req => req.jid);
            await ctx.sock.groupRequestParticipantsUpdate(ctx.remoteJid, toApprove, 'approve');
            
            await ctx.sock.sendMessage(ctx.remoteJid, {
                text: formatMessage('Admission', `✅ ${toApprove.length} membres ont été acceptés automatiquement.`)
            });
        } catch (err) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur lors du traitement.' });
        }
    }
};
