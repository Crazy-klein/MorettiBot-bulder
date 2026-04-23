import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';
import { config } from '../../config.js';

export const command = {
  name: 'kickall',
  aliases: ['clearall'],
  description: 'Expulse tous les membres (Réservé au créateur)',
  category: 'Group',
  async execute(ctx: CommandContext) {
    if (!permissions.isOwner(ctx.sender, config.ownerNumber)) {
      return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Seul le propriétaire peut exécuter cette commande.') });
    }
    if (!ctx.isGroup) return;

    try {
      const metadata = await ctx.sock.groupMetadata(ctx.remoteJid);
      const participants = metadata.participants.map(p => p.id).filter(id => id !== ctx.sock.user?.id && !permissions.isOwner(id, config.ownerNumber));
      
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Système', `⚠️ Nettoyage de ${participants.length} membres en cours...`) });

      for (const id of participants) {
        await ctx.sock.groupParticipantsUpdate(ctx.remoteJid, [id], 'remove');
        await new Promise(r => setTimeout(r, 1000)); // Pause pour éviter le ban
      }

      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Succès', 'Le groupe a été vidé.') });
    } catch (e: any) {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', e.message) });
    }
  }
};
