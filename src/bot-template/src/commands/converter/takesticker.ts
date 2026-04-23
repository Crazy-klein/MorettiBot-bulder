import { CommandContext } from '../../types/index.js';
import { mediaUtils } from '../../lib/utils.js';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { formatMessage } from '../../lib/messageStyler.js';

export const command = {
  name: 'takesticker',
  aliases: ['wm', 'take'],
  description: 'Modifier métadonnées sticker',
  category: 'Converter',
  async execute(ctx: CommandContext) {
    const isSticker = ctx.msg.message?.stickerMessage || ctx.quotedMessage?.stickerMessage;
    if (!isSticker) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', 'Répondez à un sticker.') });

    const pack = ctx.args[0] || 'Kurona';
    const author = ctx.args.slice(1).join(' ') || 'Builder';

    const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
    const quotedBuffer = ctx.quotedMessage ? await mediaUtils.download({ message: ctx.quotedMessage } as any, ctx.sock) : null;
    const finalBuffer = buffer || quotedBuffer;
    if (!finalBuffer) return;

    try {
      const sticker = new Sticker(finalBuffer, {
        pack,
        author,
        type: StickerTypes.FULL,
        quality: 100
      });
      await ctx.sock.sendMessage(ctx.remoteJid, { sticker: await sticker.toBuffer() });
    } catch {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Échec de la modification.') });
    }
  }
};
