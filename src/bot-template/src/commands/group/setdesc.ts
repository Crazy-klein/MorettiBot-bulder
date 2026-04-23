import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export const command = {
  name: 'setdesc',
  aliases: ['description'],
  description: 'Changer la description du groupe',
  category: 'Group',
  async execute(ctx: CommandContext) {
    if (!ctx.isGroup) return;
    if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

    const newDesc = ctx.args.join(' ');
    if (!newDesc) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.setdesc <nouvelle_description>') });

    try {
      await ctx.sock.groupUpdateDescription(ctx.remoteJid, newDesc);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Succès', 'Description du groupe mise à jour.') });
    } catch (e: any) {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', e.message) });
    }
  }
};
