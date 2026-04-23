import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import axios from 'axios';

export const command = {
  name: 'instagram',
  aliases: ['ig', 'reels', 'igdl'],
  description: 'Télécharge des Reels et Posts Instagram',
  category: 'Downloader',
  async execute(ctx: CommandContext) {
    const url = ctx.args[0];
    if (!url) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.ig <lien_instagram>') });

    try {
      await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '⌚', key: ctx.msg.key } });
      
      const res = await axios.get(`https://api.botcahl.com/api/download/ig?url=${url}&apikey=83798935`);
      if (res.data?.result?.[0]?.url) {
        const mediaUrl = res.data.result[0].url;
        await ctx.sock.sendMessage(ctx.remoteJid, {
          video: { url: mediaUrl },
          caption: formatMessage('Instagram Downloader', '✅ Contenu récupéré avec succès.')
        });
      } else {
        throw new Error();
      }
    } catch {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Échec du téléchargement Instagram. Vérifiez si le compte est privé.') });
    }
  }
};
