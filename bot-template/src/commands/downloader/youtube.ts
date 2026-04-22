import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';

export default {
    name: 'youtube',
    aliases: ['yt'],
    description: 'Télécharge une vidéo ou de la musique depuis YouTube',
    category: 'Downloader',
    async execute(ctx: CommandContext) {
        const query = ctx.args.join(' ');
        if (!query) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🔍 Entrez un titre ou un lien YouTube.' });

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '📺', key: ctx.msg.key } });
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Aucun résultat.' });

            const isVideo = ctx.text.toLowerCase().includes('vid') || ctx.args.includes('--vid');
            
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('YouTube', [
                    `🎬 Titre : ${video.title}`,
                    `⏱️ Durée : ${video.timestamp}`,
                    `📦 Format : ${isVideo ? 'MP4' : 'MP3'}`,
                    '',
                    '🚀 Téléchargement en cours...'
                ])
            });

            const fileName = `yt_${Date.now()}.${isVideo ? 'mp4' : 'mp3'}`;
            const filePath = path.join(process.cwd(), 'internal_storage', fileName);
            if (!fs.existsSync(path.join(process.cwd(), 'internal_storage'))) fs.mkdirSync(path.join(process.cwd(), 'internal_storage'));

            const stream = ytdl(video.url, { 
                filter: isVideo ? 'videoandaudio' : 'audioonly',
                quality: isVideo ? 'lowest' : 'highestaudio' 
            });

            const fileStream = fs.createWriteStream(filePath);
            stream.pipe(fileStream);

            fileStream.on('finish', async () => {
                const messageOptions: any = isVideo ? { video: { url: filePath } } : { audio: { url: filePath }, mimetype: 'audio/mpeg' };
                await ctx.sock.sendMessage(ctx.remoteJid, messageOptions, { quoted: ctx.msg });
                fs.unlinkSync(filePath);
            });

        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Échec du téléchargement YouTube.' });
        }
    }
};
