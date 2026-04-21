import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { mediaUtils } from '../../lib/utils.js';

export default {
    name: 'toimg',
    aliases: ['unpack', 'extraire'],
    description: 'Convertit un sticker en image',
    category: 'Converter',
    async execute(ctx: CommandContext) {
        if (ctx.mediaType !== 'sticker') {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Sicker To Image', '❌ Veuillez citer un sticker.') 
            });
        }

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '⏳ _Conversion en cours..._' });

            const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
            if (!buffer) throw new Error('Téléchargement échoué.');

            await ctx.sock.sendMessage(ctx.remoteJid, { 
                image: buffer,
                caption: formatMessage('Succès', 'Sticker converti en image avec succès.')
            });

        } catch (error: any) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur: ' + error.message });
        }
    }
};
