import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export const command = {
  name: 'approveall',
  aliases: ['acceptertous'],
  description: 'Accepte toutes les demandes d\'adhésion en attente',
  category: 'Group',
  async execute(ctx: CommandContext) {
    if (!ctx.isGroup) return;
    if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

    try {
      const pending = await ctx.sock.groupRequestParticipantsList(ctx.remoteJid);
      if (pending.length === 0) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Système', 'Aucune demande en attente.') });

      for (const user of pending) {
        await ctx.sock.groupParticipantsUpdate(ctx.remoteJid, [user.jid], 'add');
      }

      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Succès', `✅ ${pending.length} demandes acceptées.`) });
    } catch (e: any) {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', e.message) });
    }
  }
};
