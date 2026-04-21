import { CommandContext } from '../../types/index.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeExif } from '../../lib/exif.js';

const execPromise = promisify(exec);
const MAX_STICKERS = 50; // Limité pour le template

export default {
    name: 'tg',
    aliases: ['telegram', 'stickertg'],
    description: 'Télécharge un pack de stickers Telegram',
    category: 'Sticker',
    async execute(ctx: CommandContext) {
        const url = ctx.args[0];
        if (!url || !url.includes('t.me/addstickers/')) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: '⚠️ Usage: .tg https://t.me/addstickers/PackName' });
        }

        const packName = url.split('/').pop();
        const botToken = '8379893521:AAGmYtvhZ54NgKFB0_C1zsjkly7KcIIfWnU'; // Token public fourni dans l'exemple

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '⏳ _Récupération du pack Telegram..._' });

            const res = await axios.get(`https://api.telegram.org/bot${botToken}/getStickerSet?name=${packName}`);
            const data = res.data;

            if (!data.ok) throw new Error('Pack non trouvé');

            let stickers = data.result.stickers;
            if (stickers.length > MAX_STICKERS) stickers = stickers.slice(0, MAX_STICKERS);

            await ctx.sock.sendMessage(ctx.remoteJid, { text: `📦 Pack: ${stickers.length} stickers\n🚀 Envoi en cours...` });

            for (let i = 0; i < stickers.length; i++) {
                const sticker = stickers[i];
                const fileRes = await axios.get(`https://api.telegram.org/bot${botToken}/getFile?file_id=${sticker.file_id}`);
                
                if (fileRes.data.ok) {
                    const filePath = fileRes.data.result.file_path;
                    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
                    
                    const fileBuffer = await axios.get(fileUrl, { responseType: 'arraybuffer' });
                    const buffer = Buffer.from(fileBuffer.data);

                    const input = path.join(process.cwd(), `tmp_${Date.now()}_${i}`);
                    const output = path.join(process.cwd(), `out_${Date.now()}_${i}.webp`);

                    fs.writeFileSync(input, buffer);

                    // Conversion simple
                    await execPromise(`ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" "${output}"`);

                    await ctx.sock.sendMessage(ctx.remoteJid, { sticker: fs.readFileSync(output) });

                    try {
                        if (fs.existsSync(input)) fs.unlinkSync(input);
                        if (fs.existsSync(output)) fs.unlinkSync(output);
                    } catch {}
                }
                
                await new Promise(r => setTimeout(r, 1000)); // Sleep pour éviter de saturer le bot
            }

            await ctx.sock.sendMessage(ctx.remoteJid, { text: `✅ Envoi terminé !` });

        } catch (e) {
            console.error('Error TG stickers:', e);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Échec du téléchargement.' });
        }
    }
};
