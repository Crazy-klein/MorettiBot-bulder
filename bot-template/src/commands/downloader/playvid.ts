import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';

export default {
    name: 'playvid',
    aliases: ['video', 'pv'],
    description: 'Recherche et télécharge une vidéo sur YouTube',
    category: 'Downloader',
    async execute(ctx: CommandContext) {
        const query = ctx.args.join(' ');
        if (!query) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🎬 Quelle vidéo voulez-vous voir ?' });

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🎬', key: ctx.msg.key } });
            
            const search = await yts(query);
            const video = search.videos[0];
            
            if (!video) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Aucun résultat trouvé.' });

            const infoMsg = formatMessage('YouTube Video', [
                `🎞️ Titre : ${video.title}`,
                `⏱️ Durée : ${video.timestamp}`,
                `📺 Chaîne : ${video.author.name}`,
                '',
                '📦 Préparation de la vidéo...'
            ]);

            await ctx.sock.sendMessage(ctx.remoteJid, { text: infoMsg });

            const fileName = `temp_vid_${Date.now()}.mp4`;
            const filePath = path.join(process.cwd(), 'internal_storage', fileName);

            if (!fs.existsSync(path.join(process.cwd(), 'internal_storage'))) {
                fs.mkdirSync(path.join(process.cwd(), 'internal_storage'));
            }

            const stream = ytdl(video.url, { quality: 'lowestvideo' }); // Use lowest to save bandwidth/limit
            const fileStream = fs.createWriteStream(filePath);
            stream.pipe(fileStream);

            fileStream.on('finish', async () => {
                await ctx.sock.sendMessage(ctx.remoteJid, { 
                    video: { url: filePath }, 
                    caption: `✨ ${video.title}`,
                    mimetype: 'video/mp4'
                }, { quoted: ctx.msg });
                
                fs.unlinkSync(filePath);
            });

        } catch (e) {
            console.error('PlayVideo Error:', e);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Échec de la récupération vidéo. Le fichier est peut-être trop volumineux.' });
        }
    }
};
