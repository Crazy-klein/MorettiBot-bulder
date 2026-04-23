import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import axios from 'axios';

export const command = {
  name: 'searchimage',
  aliases: ['img', 'gimage'],
  description: 'Recherche d\'images Google',
  category: 'Search',
  async execute(ctx: CommandContext) {
    const query = ctx.args.join(' ');
    if (!query) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.img <sujet>') });

    try {
      await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🖼️', key: ctx.msg.key } });
      const res = await axios.get(`https://api.botcahl.com/api/search/googleimage?text=${encodeURIComponent(query)}&apikey=83798935`);
      
      if (res.data?.result?.length) {
        const images = res.data.result.slice(0, 5);
        for (const url of images) {
          await ctx.sock.sendMessage(ctx.remoteJid, { image: { url } });
        }
      } else {
        throw new Error();
      }
    } catch {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Aucune image trouvée.') });
    }
  }
};
