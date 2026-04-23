import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import axios from 'axios';

export const command = {
  name: 'gpt4',
  aliases: ['ai', 'ia', 'ask'],
  description: 'Posez une question à GPT-4',
  category: 'AI',
  async execute(ctx: CommandContext) {
    const query = ctx.args.join(' ');
    if (!query) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.gpt4 <votre_question>') });

    try {
      await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🤖', key: ctx.msg.key } });
      const res = await axios.get(`https://api.botcahl.com/api/search/openai?text=${encodeURIComponent(query)}&apikey=83798935`);
      if (res.data?.result) {
        await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('IA - GPT-4', res.data.result) });
      } else {
        throw new Error();
      }
    } catch {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'L\'IA ne répond pas pour le moment.') });
    }
  }
};
