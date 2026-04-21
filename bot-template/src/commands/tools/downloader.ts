import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export default {
    name: 'downloader',
    description: 'Télécharger des vidéos YT/TT',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        if (ctx.args.length === 0) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Downloader', 'Veuillez fournir un lien.\nExemple: .downloader https://youtube.com/...') 
            });
        }

        const url = ctx.args[0];
        
        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '⏳ _Récupération de la vidéo en cours..._' });

            // Simulation de téléchargement
            const fakeVideoBuffer = Buffer.from('fake data');

            await ctx.sock.sendMessage(ctx.remoteJid, { 
                video: fakeVideoBuffer,
                caption: formatMessage('Succès', 'Votre vidéo a été téléchargée avec succès !')
            });

        } catch (error) {
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Erreur Downloader', `Erreur: ${error instanceof Error ? error.message : 'Inconnue'}`) 
            });
        }
    }
};
