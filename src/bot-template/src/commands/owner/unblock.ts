import { CommandContext } from '../../types/index.js';
import { permissions } from '../../lib/utils.js';
import { config } from '../../config.js';
import { formatMessage } from '../../lib/messageStyler.js';

export const command = {
  name: 'unblock',
  aliases: ['debloquer'],
  description: 'Débloquer un utilisateur',
  category: 'Owner',
  async execute(ctx: CommandContext) {
    if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;

    const target = ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || ctx.quotedMessage?.participant;
    if (!target) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', 'Taguez l\'utilisateur.') });

    try {
      await ctx.sock.updateBlockStatus(target, 'unblock');
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Système', '✅ Utilisateur débloqué.') });
    } catch {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Échec du déblocage.') });
    }
  }
};
