import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export const command = {
  name: 'demote',
  aliases: ['destituer'],
  description: 'Retirer les droits d\'administrateur',
  category: 'Group',
  async execute(ctx: CommandContext) {
    if (!ctx.isGroup) return;
    if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

    const target = ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || ctx.quotedMessage?.participant;
    if (!target) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', 'Taguez l\'utilisateur ou répondez à son message.') });

    try {
      await ctx.sock.groupParticipantsUpdate(ctx.remoteJid, [target], 'demote');
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Succès', 'Utilisateur destitué de ses fonctions.') });
    } catch (e: any) {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', e.message) });
    }
  }
};
