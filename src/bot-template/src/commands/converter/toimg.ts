import { CommandContext } from '../../types/index.js';
import { mediaUtils } from '../../lib/utils.js';
import { formatMessage } from '../../lib/messageStyler.js';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

export const command = {
  name: 'toimg',
  aliases: ['image', 'photo'],
  description: 'Sticker → Image',
  category: 'Converter',
  async execute(ctx: CommandContext) {
    const isSticker = ctx.msg.message?.stickerMessage || ctx.quotedMessage?.stickerMessage;
    if (!isSticker) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', 'Répondez à un sticker.') });

    const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
    const quotedBuffer = ctx.quotedMessage ? await mediaUtils.download({ message: ctx.quotedMessage } as any, ctx.sock) : null;
    const finalBuffer = buffer || quotedBuffer;

    if (!finalBuffer) return;

    try {
      await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🖼️', key: ctx.msg.key } });
      
      const tempInput = path.join(process.cwd(), `temp_${Date.now()}.webp`);
      const tempOutput = path.join(process.cwd(), `temp_${Date.now()}.png`);
      
      fs.writeFileSync(tempInput, finalBuffer);
      await execPromise(`ffmpeg -i ${tempInput} ${tempOutput}`);
      
      await ctx.sock.sendMessage(ctx.remoteJid, { 
        image: fs.readFileSync(tempOutput),
        caption: formatMessage('Conversion', '✅ Sticker converti avec succès.')
      });

      fs.unlinkSync(tempInput);
      fs.unlinkSync(tempOutput);
    } catch {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Échec de conversion.') });
    }
  }
};
