import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';

export default {
    name: 'play',
    aliases: ['music', 'song'],
    description: 'Recherche et télécharge une musique sur YouTube',
    category: 'Downloader',
    async execute(ctx: CommandContext) {
        const query = ctx.args.join(' ');
        if (!query) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🎵 Quel titre voulez-vous écouter ?' });

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🔍', key: ctx.msg.key } });
            
            const search = await yts(query);
            const video = search.videos[0];
            
            if (!video) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Aucun résultat trouvé.' });

            const infoMsg = formatMessage('YouTube Music', [
                `🎵 Titre : ${video.title}`,
                `⏱️ Durée : ${video.timestamp}`,
                `📺 Chaîne : ${video.author.name}`,
                `🔗 URL : ${video.url}`,
                '',
                '🚀 Envoi du fichier audio...'
            ]);

            await ctx.sock.sendMessage(ctx.remoteJid, { 
                image: { url: video.thumbnail },
                caption: infoMsg
            });

            const stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' });
            const fileName = `temp_${Date.now()}.mp3`;
            const filePath = path.join(process.cwd(), 'internal_storage', fileName);

            // Ensure directory exists
            if (!fs.existsSync(path.join(process.cwd(), 'internal_storage'))) {
                fs.mkdirSync(path.join(process.cwd(), 'internal_storage'));
            }

            const fileStream = fs.createWriteStream(filePath);
            stream.pipe(fileStream);

            fileStream.on('finish', async () => {
                await ctx.sock.sendMessage(ctx.remoteJid, { 
                    audio: { url: filePath }, 
                    mimetype: 'audio/mpeg',
                    fileName: `${video.title}.mp3`
                }, { quoted: ctx.msg });
                
                // Cleanup
                fs.unlinkSync(filePath);
            });

        } catch (e) {
            console.error('Play Error:', e);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur technique. Le service YouTube est peut-être saturé.' });
        }
    }
};
