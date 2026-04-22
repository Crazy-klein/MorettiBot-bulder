import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import axios from 'axios';
import yts from 'yt-search';

export default {
    name: 'youtube',
    aliases: ['yt', 'ytdl'],
    description: 'Recherche et télécharge de l\'audio YouTube',
    category: 'Downloader',
    async execute(ctx: CommandContext) {
        const query = ctx.args.join(' ');
        if (!query) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .yt <recherche/lien>' });

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🎵', key: ctx.msg.key } });
            
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) throw new Error('Vidéo non trouvée');

            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('YouTube System', `⏳ Téléchargement de : ${video.title}...`) 
            });

            // Utilisation d'un proxy de téléchargement pour le template
            const dlUrl = `https://api.botcahl.com/api/download/ytmp3?url=${video.url}&apikey=83798935`;
            const res = await axios.get(dlUrl);

            if (res.data?.result?.url) {
                await ctx.sock.sendMessage(ctx.remoteJid, {
                    audio: { url: res.data.result.url },
                    mimetype: 'audio/mpeg',
                    fileName: `${video.title}.mp3`
                });
            } else {
                throw new Error();
            }
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur YouTube. Réessayez.' });
        }
    }
};
