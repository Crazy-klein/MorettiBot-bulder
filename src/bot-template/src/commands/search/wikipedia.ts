import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import axios from 'axios';

export const command = {
  name: 'wikipedia',
  aliases: ['wiki', 'saviezvous'],
  description: 'Recherche Wikipédia',
  category: 'Search',
  async execute(ctx: CommandContext) {
    const query = ctx.args.join(' ');
    if (!query) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.wiki <sujet>') });

    try {
      const res = await axios.get(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
      if (res.data?.extract) {
        await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage(`Wikipédia : ${res.data.title}`, res.data.extract) });
      } else {
        throw new Error();
      }
    } catch {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Sujet introuvable sur Wikipédia.') });
    }
  }
};
