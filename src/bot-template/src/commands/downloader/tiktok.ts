import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import axios from 'axios';

export const command = {
  name: 'tiktok',
  aliases: ['tt', 'ttdl'],
  description: 'Télécharge une vidéo TikTok sans filigrane',
  category: 'Downloader',
  async execute(ctx: CommandContext) {
    const url = ctx.args[0];
    if (!url) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.tiktok <lien>') });

    try {
      await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '⌚', key: ctx.msg.key } });
      
      const res = await axios.get(`https://tikwm.com/api/?url=${url}`);
      const data = res.data.data;
      
      if (data?.play) {
        await ctx.sock.sendMessage(ctx.remoteJid, {
          video: { url: data.play },
          caption: formatMessage('TikTok Downloader', [
            `👤 Auteur : ${data.author.nickname}`,
            `📝 Titre : ${data.title.slice(0, 50)}...`,
            `📊 Stats : ❤️ ${data.digg_count} | 💬 ${data.comment_count}`
          ])
        });
        await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '✅', key: ctx.msg.key } });
      } else {
        throw new Error('Données introuvables');
      }
    } catch (e: any) {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Échec du téléchargement TikTok. Vérifiez le lien.') });
    }
  }
};
