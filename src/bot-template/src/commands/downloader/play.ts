import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import axios from 'axios';
import yts from 'yt-search';

export const command = {
  name: 'play',
  aliases: ['p', 'musique'],
  description: 'Recherche et lecture musique',
  category: 'Downloader',
  async execute(ctx: CommandContext) {
    const query = ctx.args.join(' ');
    if (!query) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.play <titre>') });

    try {
      await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '⌚', key: ctx.msg.key } });
      
      const search = await yts(query);
      const video = search.videos[0];
      if (!video) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Aucun résultat.') });

      await ctx.sock.sendMessage(ctx.remoteJid, { 
        image: { url: video.thumbnail },
        caption: formatMessage('Lecture en cours', [
          `🎵 Titre : ${video.title}`,
          `⏳ Durée : ${video.timestamp}`,
          `👁️ Vues : ${video.views}`,
          `📅 Publiée : ${video.ago}`
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
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Impossible de lire cette musique.') });
    }
  }
};
