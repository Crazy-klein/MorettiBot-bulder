import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export const command = {
  name: 'setname',
  aliases: ['nomgroupe'],
  description: 'Changer le nom du groupe',
  category: 'Group',
  async execute(ctx: CommandContext) {
    if (!ctx.isGroup) return;
    if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

    const newName = ctx.args.join(' ');
    if (!newName) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.setname <nouveau_nom>') });

    try {
      await ctx.sock.groupUpdateSubject(ctx.remoteJid, newName);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Succès', 'Nom du groupe mis à jour.') });
    } catch (e: any) {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', e.message) });
    }
  }
};
