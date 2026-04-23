import { CommandContext } from '../../types/index.js';
import { mediaUtils } from '../../lib/utils.js';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { formatMessage } from '../../lib/messageStyler.js';

export const command = {
  name: 'sticker',
  aliases: ['s', 'stik'],
  description: 'Image/Vidéo → Sticker',
  category: 'Converter',
  async execute(ctx: CommandContext) {
    const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
    const quotedBuffer = ctx.quotedMessage ? await mediaUtils.download({ message: ctx.quotedMessage } as any, ctx.sock) : null;
    const finalBuffer = buffer || quotedBuffer;

    if (!finalBuffer) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', 'Envoyez ou répondez à une image/vidéo.') });

    try {
      await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '✨', key: ctx.msg.key } });
      
      const sticker = new Sticker(finalBuffer, {
        pack: 'Kurona Pack',
        author: 'KuronaBot Builder',
        type: StickerTypes.FULL,
        quality: 100
      });

      await ctx.sock.sendMessage(ctx.remoteJid, { sticker: await sticker.toBuffer() });
    } catch {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Échec de la création du sticker.') });
    }
  }
};
