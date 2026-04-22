import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import fs from 'fs';
import path from 'path';

export default {
    name: 'sendaudio',
    aliases: ['saud'],
    description: 'Envoie un audio/vocal depuis le répertoire local medias/audios',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        const fileName = ctx.args[0];
        if (!fileName) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .sendaudio <nom_fichier> [--ptt]' });

        const dir = path.join(process.cwd(), 'database', 'medias', 'audios');
        const filePath = path.join(dir, fileName.includes('.') ? fileName : `${fileName}.mp3`);
        const isPTT = ctx.fullArgs.includes('--ptt');

        if (!fs.existsSync(filePath)) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: `❌ Audio "${fileName}" introuvable.` });
        }

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                audio: fs.readFileSync(filePath),
                mimetype: 'audio/mpeg',
                ptt: isPTT
            });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de lecture audio.' });
        }
    }
};
