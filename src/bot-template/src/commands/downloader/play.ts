import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import axios from 'axios';
import yts from 'yt-search';

export default {
    name: 'play',
    aliases: ['p', 'song'],
    description: 'Joue une musique depuis YouTube',
    category: 'Downloader',
    async execute(ctx: CommandContext) {
        const query = ctx.args.join(' ');
        if (!query) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🎵 Quelle musique voulez-vous écouter ?' });

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🎧', key: ctx.msg.key } });
            
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Aucun résultat.' });

            await ctx.sock.sendMessage(ctx.remoteJid, {
                image: { url: video.thumbnail },
                caption: formatMessage('Now Playing', [
                    `🎵 Titre : ${video.title}`,
                    `🔗 Lien : ${video.url}`,
                    `⏳ Durée : ${video.timestamp}`,
                    `👁️ Vues : ${video.views}`
                ])
            });

            const res = await axios.get(`https://api.botcahl.com/api/download/ytmp3?url=${video.url}&apikey=83798935`);
            if (res.data?.result?.url) {
                await ctx.sock.sendMessage(ctx.remoteJid, {
                    audio: { url: res.data.result.url },
                    mimetype: 'audio/mpeg',
                    ptt: false
                });
            }
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Échec de lecture.' });
        }
    }
};
