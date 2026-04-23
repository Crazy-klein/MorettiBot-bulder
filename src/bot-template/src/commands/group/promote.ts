import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export const command = {
  name: 'promote',
  aliases: ['publier', 'nommer'],
  description: 'Nommer un membre administrateur',
  category: 'Group',
  async execute(ctx: CommandContext) {
    if (!ctx.isGroup) return;
    if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

    const target = ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || ctx.quotedMessage?.participant;
    if (!target) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', 'Taguez l\'utilisateur ou répondez à son message.') });

    try {
      await ctx.sock.groupParticipantsUpdate(ctx.remoteJid, [target], 'promote');
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Succès', 'Utilisateur promu administrateur.') });
    } catch (e: any) {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', e.message) });
    }
  }
};
