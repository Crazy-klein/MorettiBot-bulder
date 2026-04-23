import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import axios from 'axios';

export const command = {
  name: 'dalle',
  aliases: ['imagine', 'genimg'],
  description: 'Génère une image via IA',
  category: 'AI',
  async execute(ctx: CommandContext) {
    const prompt = ctx.args.join(' ');
    if (!prompt) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.dalle <votre_description>') });

    try {
      await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🎨', key: ctx.msg.key } });
      const res = await axios.get(`https://api.botcahl.com/api/maker/dalle?text=${encodeURIComponent(prompt)}&apikey=83798935`);
      if (res.data?.result) {
        await ctx.sock.sendMessage(ctx.remoteJid, { 
          image: { url: res.data.result }, 
          caption: formatMessage('IA - DALL-E', `🎨 Résultat pour : ${prompt}`)
        });
      } else {
        throw new Error();
      }
    } catch {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Échec de génération d\'image.') });
    }
  }
};
