import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { mediaUtils } from '../../lib/utils.js';

export default {
    name: 'sticker',
    aliases: ['s', 'stk'],
    description: 'Convertit une image ou une vidéo en sticker',
    category: 'Converter',
    async execute(ctx: CommandContext) {
        if (ctx.mediaType !== 'image' && ctx.mediaType !== 'video') {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Sticker Maker', '❌ Veuillez envoyer ou citer une image/vidéo courte.') 
            });
        }

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '⏳ _Génération de votre sticker..._' });

            const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
            if (!buffer) throw new Error('Impossible de charger le média.');

            // L'envoi direct via Baileys avec mimetype image/webp suffit souvent
            // KuronaBot Builder peut inclure une lib de traitement (Sharp/Fluent-ffmpeg) plus tard
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                sticker: buffer,
                mimetype: 'image/webp'
            });

        } catch (error: any) {
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Erreur Sticker', `Erreur: ${error.message}`) 
            });
        }
    }
};
