import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import axios from 'axios';

export const command = {
  name: 'google',
  aliases: ['search', 'trouver'],
  description: 'Recherche Google',
  category: 'Search',
  async execute(ctx: CommandContext) {
    const query = ctx.args.join(' ');
    if (!query) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.google <requête>') });

    try {
      const res = await axios.get(`https://api.botcahl.com/api/search/google?text=${encodeURIComponent(query)}&apikey=83798935`);
      if (res.data?.result?.length) {
        let results = res.data.result.slice(0, 3).map((r: any) => `🔗 *${r.title}*\n${r.snippet}\n${r.link}`).join('\n\n');
        await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Google Search', results) });
      } else {
        throw new Error();
      }
    } catch {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Aucun résultat trouvé.') });
    }
  }
};
