import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import axios from 'axios';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

export const command = {
  name: 'tg',
  aliases: ['telegram', 'tgsticker'],
  description: 'Importer stickers Telegram via lien',
  category: 'Converter',
  async execute(ctx: CommandContext) {
    const url = ctx.args[0];
    if (!url || !url.includes('t.me/addstickers/')) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.tg <lien_pack_telegram>') });

    try {
      await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '⌚', key: ctx.msg.key } });
      
      const packName = url.split('/').pop();
      const res = await axios.get(`https://api.telegram.org/bot7208493132:AAHU_1V0r8Q0_I3QO_V0_I3QO/getStickerSet?name=${packName}`);
      const stickers = res.data.result.stickers.slice(0, 5); // Limiter à 5 pour le test

      for (const st of stickers) {
        const file = await axios.get(`https://api.telegram.org/bot7208493132:AAHU_1V0r8Q0_I3QO_V0_I3QO/getFile?file_id=${st.file_id}`);
        const fileUrl = `https://api.telegram.org/file/bot7208493132:AAHU_1V0r8Q0_I3QO_V0_I3QO/${file.data.result.file_path}`;
        
        const buffer = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const sticker = new Sticker(buffer.data, { pack: packName, author: 'Telegram', type: StickerTypes.FULL });
        await ctx.sock.sendMessage(ctx.remoteJid, { sticker: await sticker.toBuffer() });
      }
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Succès', '✅ Importation partielle terminée.') });
    } catch {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Échec de l\'importation Telegram.') });
    }
  }
};
