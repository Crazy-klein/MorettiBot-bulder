import { CommandContext } from '../../types/index.js';
import { formatMessage, mediaUtils } from '../../lib/utils.js';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

export default {
    name: 'sticker',
    aliases: ['s', 'stk'],
    description: 'Convertit une image ou une vidéo en sticker',
    category: 'Converter',
    async execute(ctx: CommandContext) {
        const isMedia = ctx.mediaType === 'image' || ctx.mediaType === 'video' || 
                        Object.keys(ctx.quotedMessage || {}).some(k => k.includes('image') || k.includes('video'));

        if (!isMedia) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Sticker Maker', '❌ Veuillez envoyer ou citer une image/vidéo courte.') 
            });
        }

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🎨', key: ctx.msg.key } });

            const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
            if (!buffer) throw new Error('Impossible de charger le média.');

            const sticker = new Sticker(buffer, {
                pack: 'Kurona Arsenal',
                author: 'KuronaBot Builder',
                type: StickerTypes.FULL,
                categories: ['🤩', '🎉'],
                id: '12345',
                quality: 70,
            });

            const stickerBuffer = await sticker.toBuffer();
            await ctx.sock.sendMessage(ctx.remoteJid, { sticker: stickerBuffer });

        } catch (error: any) {
            console.error('Sticker Error:', error);
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Erreur Sticker', `Échec : ${error.message}`) 
            });
        }
    }
};
