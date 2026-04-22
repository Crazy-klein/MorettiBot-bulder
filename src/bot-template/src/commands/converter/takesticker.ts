import { CommandContext } from '../../types/index.js';
import { formatMessage, mediaUtils } from '../../lib/utils.js';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

export default {
    name: 'takesticker',
    aliases: ['tks', 'steal', 'wm'],
    description: 'Change les métadonnées d\'un sticker',
    category: 'Converter',
    async execute(ctx: CommandContext) {
        const isSticker = ctx.mediaType === 'sticker' || 
                         Object.keys(ctx.quotedMessage || {}).includes('stickerMessage');

        if (!isSticker) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Citez un sticker.' });

        const pack = ctx.args[0] || 'Kurona Arsenal';
        const author = ctx.args.slice(1).join(' ') || 'KuronaBot Builder';

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '✨', key: ctx.msg.key } });
            const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
            if (!buffer) throw new Error();

            const sticker = new Sticker(buffer, {
                pack,
                author,
                type: StickerTypes.FULL,
                quality: 70,
            });

            const stkBuffer = await sticker.toBuffer();
            await ctx.sock.sendMessage(ctx.remoteJid, { sticker: stkBuffer });

        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de modification.' });
        }
    }
};
