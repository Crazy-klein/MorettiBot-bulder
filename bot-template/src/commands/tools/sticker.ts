import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { downloadMedia } from '../../lib/utils.js';

export default {
    name: 'sticker',
    description: 'Convertir image en sticker',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        // Vérifier si le message direct ou cité contient une image
        const isImage = ctx.mediaType === 'image';
        
        if (!isImage) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Sticker Maker', 'Veuillez envoyer ou citer une image avec la commande .sticker') 
            });
        }

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '⏳ _Génération du sticker en cours..._' });

            const buffer = await downloadMedia(ctx.msg, ctx.sock);
            if (!buffer) throw new Error('Impossible de télécharger le média');

            // Dans un vrai bot, on utiliserait une lib pour convertir en webp
            // Ici, on simule l'envoi du sticker
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                sticker: buffer,
                mimetype: 'image/webp'
            });

        } catch (error) {
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Erreur Sticker', `Erreur: ${error instanceof Error ? error.message : 'Inconnue'}`) 
            });
        }
    }
};
