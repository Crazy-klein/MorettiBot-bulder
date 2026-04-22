import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions } from '../../lib/utils.js';
import { config } from '../../config.js';

export default {
    name: 'kickall',
    description: 'Expulse tous les membres non-admins (Owner uniquement)',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🚫 Commande réservée au propriétaire.' });

        try {
            const metadata = await ctx.sock.groupMetadata(ctx.remoteJid);
            const targets = metadata.participants.filter(p => !p.admin).map(p => p.id);

            if (targets.length === 0) return await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Aucune cible à expulser.' });

            await ctx.sock.sendMessage(ctx.remoteJid, { text: `⏳ _Expulsion de ${targets.length} membres en cours..._` });

            for (const target of targets) {
                await ctx.sock.groupParticipantsUpdate(ctx.remoteJid, [target], 'remove');
                await new Promise(r => setTimeout(r, 1500)); // Protection anti-ban
            }

            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Succès', 'Le groupe a été vidé de ses membres non-admins.') });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur Technique.' });
        }
    }
};
