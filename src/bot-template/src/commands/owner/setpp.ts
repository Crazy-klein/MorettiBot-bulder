import { CommandContext } from '../../types/index.js';
import { mediaUtils, permissions } from '../../lib/utils.js';
import { config } from '../../config.js';
import { formatMessage } from '../../lib/messageStyler.js';

export const command = {
  name: 'setpp',
  aliases: ['updpp', 'icon'],
  description: 'Changer la photo de profil du bot',
  category: 'Owner',
  async execute(ctx: CommandContext) {
    if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;

    const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
    const quotedBuffer = ctx.quotedMessage ? await mediaUtils.download({ message: ctx.quotedMessage } as any, ctx.sock) : null;
    const finalBuffer = buffer || quotedBuffer;

    if (!finalBuffer) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', 'Envoyez ou répondez à une image.') });

    try {
      await ctx.sock.updateProfilePicture(ctx.sock.user!.id, finalBuffer);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Succès', '✅ Photo de profil mise à jour.') });
    } catch {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Échec de la mise à jour.') });
    }
  }
};
