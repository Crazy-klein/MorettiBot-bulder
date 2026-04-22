import { CommandContext } from '../../types/index.js';
import { mediaUtils } from '../../lib/utils.js';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

export default {
    name: 'toimg',
    aliases: ['image'],
    description: 'Transforme un sticker en image',
    category: 'Converter',
    async execute(ctx: CommandContext) {
        if (!ctx.msg.message?.stickerMessage && !ctx.quotedMessage?.stickerMessage) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Répondez à un sticker.' });
        }

        const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
        if (!buffer) return;

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🖼️', key: ctx.msg.key } });
            
            const tempInput = path.join(process.cwd(), `temp_${Date.now()}.webp`);
            const tempOutput = path.join(process.cwd(), `temp_${Date.now()}.png`);
            
            fs.writeFileSync(tempInput, buffer);
            await execPromise(`ffmpeg -i ${tempInput} ${tempOutput}`);
            
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                image: fs.readFileSync(tempOutput),
                caption: '✅ Sticker converti avec succès.'
            });

            fs.unlinkSync(tempInput);
            fs.unlinkSync(tempOutput);
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Échec de conversion.' });
        }
    }
};
