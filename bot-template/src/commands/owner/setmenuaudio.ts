import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';
import { config } from '../../config.js';
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execPromise = promisify(exec);

export default {
    name: 'setmenuaudio',
    aliases: ['setaudio', 'menuaudio'],
    description: 'Change l\'audio du menu (Owner uniquement)',
    category: 'Owner',
    async execute(ctx: CommandContext) {
        if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;

        if (!ctx.quotedMessage?.audioMessage) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: '⚠️ Répondez à un audio pour l\'utiliser comme son de menu.' });
        }

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '📥 _Téléchargement et conversion en cours..._' });

            const buffer = await downloadMediaMessage(ctx.msg, 'buffer', {});
            const tempInput = path.join(process.cwd(), `temp_${Date.now()}.mp3`);
            const finalOutput = path.join(process.cwd(), 'assets', 'menu_sound.ogg');

            fs.writeFileSync(tempInput, buffer as Buffer);

            // Conversion via FFmpeg en format OGG compatible WhatsApp
            await execPromise(`ffmpeg -y -i ${tempInput} -c:a libopus -b:a 32k ${finalOutput}`);

            await ctx.sock.sendMessage(ctx.remoteJid, { text: '✅ Audio du menu mis à jour avec succès !' });

            if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);

        } catch (e) {
            console.error('Error setmenuaudio:', e);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de traitement audio.' });
        }
    }
};
