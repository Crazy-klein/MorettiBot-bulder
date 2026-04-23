import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export const command = {
  name: 'kick',
  aliases: ['expulser', 'enlever'],
  description: 'Expulser un membre du groupe',
  category: 'Group',
  async execute(ctx: CommandContext) {
    if (!ctx.isGroup) return;
    if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) {
      return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Vous n\'êtes pas administrateur.') });
    }

    const target = ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || ctx.quotedMessage?.participant;
    if (!target) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', 'Taguez l\'utilisateur ou répondez à son message.') });

    try {
      await ctx.sock.groupParticipantsUpdate(ctx.remoteJid, [target], 'remove');
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Succès', 'Utilisateur expulsé avec succès.') });
    } catch (e: any) {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', e.message) });
    }
  }
};
