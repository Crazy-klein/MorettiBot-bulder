import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { scraping } from '../../lib/utils.js';

export default {
    name: 'youtube',
    aliases: ['yt', 'video', 'song', 'play'],
    description: 'Télécharge une vidéo ou de la musique depuis YouTube',
    category: 'Downloader',
    async execute(ctx: CommandContext) {
        const query = ctx.args.join(' ');
        if (!query) return;

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '🔍 _Recherche sur YouTube..._' });
            const videoId = await scraping.getYoutubeId(query);

            if (!videoId) {
                return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Aucun résultat.' });
            }

            const url = `https://www.youtube.com/watch?v=${videoId}`;
            
            // Dans le template, on fournit le lien car le téléchargement serveur 
            // exige ytdl-core qui est souvent instable ou interdit sur certains hosts.
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('YouTube Downloader', [
                    `🎬 Vidéo trouvée !`,
                    `🔗 Lien: ${url}`,
                    '',
                    '_NB: Utilisez un service externe pour convertir en MP3/MP4 si nécessaire._'
                ])
            });

        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur YouTube.' });
        }
    }
};
