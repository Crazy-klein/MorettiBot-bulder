import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export const command = {
  name: 'voice',
  aliases: ['vocal', 'ptt'],
  description: 'Texte vers note vocale',
  category: 'Tools',
  async execute(ctx: CommandContext) {
    const text = ctx.args.join(' ');
    if (!text) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.voice <texte>') });

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=fr&client=tw-ob`;
    await ctx.sock.sendMessage(ctx.remoteJid, { audio: { url }, mimetype: 'audio/mpeg', ptt: true });
  }
};
