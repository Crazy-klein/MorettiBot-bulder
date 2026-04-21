import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export default {
    name: 'kickall',
    description: 'Expulse tous les membres non-admins (Owner uniquement)',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;

        // Note: Dans un template, on limite cette commande au propriétaire par sécurité
        const isOwner = permissions.isOwner(ctx.sender, 'YOUR_OWNER_NUMBER_HERE'); // Injecté dynamiquement
        if (!isOwner) return;

        try {
            const metadata = await ctx.sock.groupMetadata(ctx.remoteJid);
            const targets = metadata.participants.filter(p => !p.admin).map(p => p.id);

            if (targets.length === 0) return await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Aucune cible.' });

            await ctx.sock.sendMessage(ctx.remoteJid, { text: `⏳ _Nettoyage de ${targets.length} membres en cours..._` });

            for (const target of targets) {
                await ctx.sock.groupParticipantsUpdate(ctx.remoteJid, [target], 'remove');
                await new Promise(r => setTimeout(r, 1000)); // Sleep 1s pour éviter le spam/ban
            }

            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Succès', 'Le groupe a été vidé.') });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur kickall.' });
        }
    }
};
