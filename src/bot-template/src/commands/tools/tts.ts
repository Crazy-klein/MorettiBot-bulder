import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export const command = {
  name: 'tts',
  aliases: ['dire', 'parler'],
  description: 'Texte vers audio',
  category: 'Tools',
  async execute(ctx: CommandContext) {
    const text = ctx.args.join(' ');
    if (!text) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.tts <texte>') });

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=fr&client=tw-ob`;
    await ctx.sock.sendMessage(ctx.remoteJid, { audio: { url }, mimetype: 'audio/mpeg', ptt: false });
  }
};
