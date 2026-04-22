import { CommandContext } from '../../types/index.js';
import { formatMessage, mediaUtils } from '../../lib/utils.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

const execPromise = promisify(exec);
const MAX_STICKERS = 15; // Limité pour éviter les crashs/bans

export default {
    name: 'tg',
    aliases: ['telegram', 'stickertg'],
    description: 'Télécharge un pack de stickers Telegram',
    category: 'Converter',
    async execute(ctx: CommandContext) {
        const url = ctx.args[0];
        if (!url || !url.includes('t.me/addstickers/')) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: '⚠️ Usage: .tg https://t.me/addstickers/PackName' });
        }

        const packName = url.split('/').pop();
        const botToken = '8379893521:AAGmYtvhZ54NgKFB0_C1zsjkly7KcIIfWnU';

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '📦', key: ctx.msg.key } });
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '⏳ _Récupération du pack..._' });

            const res = await axios.get(`https://api.telegram.org/bot${botToken}/getStickerSet?name=${packName}`);
            if (!res.data.ok) throw new Error('Pack non trouvé');

            let stickers = res.data.result.stickers;
            if (stickers.length > MAX_STICKERS) stickers = stickers.slice(0, MAX_STICKERS);

            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Telegram', `📂 Pack: ${res.data.result.title}\n🚀 Envoi de ${stickers.length} stickers...`) });

            const storageDir = path.join(process.cwd(), 'database', 'internal_storage');
            if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

            for (const sticker of stickers) {
                const fileRes = await axios.get(`https://api.telegram.org/bot${botToken}/getFile?file_id=${sticker.file_id}`);
                if (fileRes.data.ok) {
                    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileRes.data.result.file_path}`;
                    const fileBuffer = await axios.get(fileUrl, { responseType: 'arraybuffer' });
                    
                    const stk = new Sticker(fileBuffer.data, {
                        pack: res.data.result.title,
                        author: 'KuronaBot Builder',
                        type: StickerTypes.FULL,
                        quality: 50
                    });

                    await ctx.sock.sendMessage(ctx.remoteJid, { sticker: await stk.toBuffer() });
                }
                await new Promise(r => setTimeout(r, 800));
            }

            await ctx.sock.sendMessage(ctx.remoteJid, { text: '✅ Envoi du pack terminé !' });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Échec du téléchargement Telegram.' });
        }
    }
};
