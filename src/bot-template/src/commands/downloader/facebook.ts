import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import axios from 'axios';

export const command = {
  name: 'facebook',
  aliases: ['fb', 'fbdl'],
  description: 'Télécharge une vidéo Facebook',
  category: 'Downloader',
  async execute(ctx: CommandContext) {
    const url = ctx.args[0];
    if (!url) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.fb <lien>') });

    try {
      await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '⌚', key: ctx.msg.key } });
      
      const res = await axios.get(`https://api.botcahl.com/api/download/fb?url=${url}&apikey=83798935`);
      if (res.data?.result?.url) {
        await ctx.sock.sendMessage(ctx.remoteJid, {
          video: { url: res.data.result.url },
          caption: formatMessage('Facebook Downloader', '✅ Vidéo récupérée avec succès.')
        });
        await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '✅', key: ctx.msg.key } });
      } else {
        throw new Error();
      }
    } catch {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Échec du téléchargement Facebook.') });
    }
  }
};
