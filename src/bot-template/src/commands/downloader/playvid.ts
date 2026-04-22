import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import axios from 'axios';
import yts from 'yt-search';

export default {
    name: 'playvid',
    aliases: ['pv', 'video'],
    description: 'Télécharge une vidéo YouTube',
    category: 'Downloader',
    async execute(ctx: CommandContext) {
        const query = ctx.args.join(' ');
        if (!query) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🎬 Quelle vidéo voulez-vous ?' });

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🎬', key: ctx.msg.key } });
            
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Aucun résultat.' });

            const res = await axios.get(`https://api.botcahl.com/api/download/ytmp4?url=${video.url}&apikey=83798935`);
            if (res.data?.result?.url) {
                await ctx.sock.sendMessage(ctx.remoteJid, {
                    video: { url: res.data.result.url },
                    caption: formatMessage('YouTube Video', video.title)
                });
            } else {
                throw new Error();
            }
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Échec vidéo.' });
        }
    }
};
