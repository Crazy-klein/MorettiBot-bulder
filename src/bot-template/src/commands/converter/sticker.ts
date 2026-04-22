import { CommandContext } from '../../types/index.js';
import { mediaUtils } from '../../lib/utils.js';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

export default {
    name: 'sticker',
    aliases: ['s', 'stiker'],
    description: 'Transforme une image/vidéo en sticker',
    category: 'Converter',
    async execute(ctx: CommandContext) {
        const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
        if (!buffer) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Envoyez ou répondez à une image/vidéo.' });

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '✨', key: ctx.msg.key } });
            
            const sticker = new Sticker(buffer, {
                pack: 'KuronaBot Pack',
                author: 'KuronaBot Builder',
                type: StickerTypes.FULL,
                quality: 100
            });

            await ctx.sock.sendMessage(ctx.remoteJid, { sticker: await sticker.toBuffer() });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Échec de création du sticker.' });
        }
    }
};
