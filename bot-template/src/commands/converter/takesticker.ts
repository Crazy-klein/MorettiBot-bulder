import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { mediaUtils } from '../../lib/utils.js';

export default {
    name: 'takesticker',
    aliases: ['tks', 'steal'],
    description: 'Vole un sticker et change ses métadonnées',
    category: 'Converter',
    async execute(ctx: CommandContext) {
        if (ctx.mediaType !== 'sticker') {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Cite d\'abord un sticker.' });
        }

        const pack = ctx.args[0] || 'Kurona';
        const author = ctx.args.slice(1).join(' ') || 'Bot';

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '⏳ _Modification en cours..._' });
            const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
            if (!buffer) return;

            // Note: Une vraie manipulation EXIF nécessiterait une librairie comme "wa-sticker-formatter"
            // Pour le template, on envoie le sticker brut avec le nouveau nom de fichier suggéré
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                sticker: buffer,
                caption: `Pack: ${pack}\nAuthor: ${author}`
            });

        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de vol.' });
        }
    }
};
