import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import axios from 'axios';
import yts from 'yt-search';

export const command = {
  name: 'youtube',
  aliases: ['yt', 'ytdl'],
  description: 'Téléchargement audio YouTube (MP3)',
  category: 'Downloader',
  async execute(ctx: CommandContext) {
    const query = ctx.args.join(' ');
    if (!query) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.yt <recherche/lien>') });

    try {
      await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '⌚', key: ctx.msg.key } });
      
      const search = await yts(query);
      const video = search.videos[0];
      if (!video) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Vidéo introuvable.') });

      const res = await axios.get(`https://api.botcahl.com/api/download/ytmp3?url=${video.url}&apikey=83798935`);
      if (res.data?.result?.url) {
        await ctx.sock.sendMessage(ctx.remoteJid, {
          audio: { url: res.data.result.url },
          mimetype: 'audio/mpeg',
          fileName: `${video.title}.mp3`
        });
        await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '✅', key: ctx.msg.key } });
      } else {
        throw new Error();
      }
    } catch {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Échec du téléchargement YouTube.') });
    }
  }
};
