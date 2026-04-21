import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export default {
    name: 'approveall',
    aliases: ['approuver'],
    description: 'Approuve toutes les demandes d\'adhésion en attente.',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;

        const isUserAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender);
        if (!isUserAdmin) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Cette commande est réservée aux administrateurs.' });
        }

        try {
            const requests = await ctx.sock.groupRequestParticipantsList(ctx.remoteJid);
            if (!requests || requests.length === 0) {
                return await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Aucun membre à approuver dans ce groupe.' });
            }

            const toApprove = requests.map(req => req.jid);
            await ctx.sock.groupRequestParticipantsUpdate(ctx.remoteJid, toApprove, 'approve');
            
            await ctx.sock.sendMessage(ctx.remoteJid, {
                image: { url: 'https://files.catbox.moe/hsn1wp.jpg' },
                caption: formatMessage('Admission', `Les ${toApprove.length} utilisateurs en attente ont été approuvés.`)
            });
        } catch (err) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur lors de l\'approbation.' });
        }
    }
};
