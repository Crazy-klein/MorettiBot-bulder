import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, mediaUtils } from '../../lib/utils.js';
import { config } from '../../config.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execPromise = promisify(exec);

export default {
    name: 'setmenuaudio',
    aliases: ['setaudio'],
    description: 'Change l\'audio du menu (Owner uniquement)',
    category: 'Owner',
    async execute(ctx: CommandContext) {
        if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;

        const isAudio = ctx.mediaType === 'audio' || Object.keys(ctx.quotedMessage || {}).includes('audioMessage');
        if (!isAudio) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '⚠️ Répondez à un audio.' });

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🎵', key: ctx.msg.key } });
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '📥 _Conversion de l\'audio menu..._' });

            const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
            const assetsDir = path.join(process.cwd(), 'database', 'assets');
            if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

            const tempInput = path.join(assetsDir, `temp_${Date.now()}.mp3`);
            const finalOutput = path.join(assetsDir, 'menu_sound.ogg');

            fs.writeFileSync(tempInput, buffer as Buffer);

            // Conversion via FFmpeg
            await execPromise(`ffmpeg -y -i ${tempInput} -c:a libopus -b:a 32k ${finalOutput}`);

            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Bot Design', '✅ Audio du menu mis à jour avec succès.') });

            if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur FFmpeg / Traitement.' });
        }
    }
};
