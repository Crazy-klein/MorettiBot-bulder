import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import fs from 'fs';
import path from 'path';

export default {
    name: 'sendvideo',
    aliases: ['svid'],
    description: 'Envoie une vidéo depuis le répertoire local medias/videos',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        const fileName = ctx.args[0];
        if (!fileName) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .sendvideo <nom_fichier>' });

        const dir = path.join(process.cwd(), 'database', 'medias', 'videos');
        const filePath = path.join(dir, fileName.includes('.') ? fileName : `${fileName}.mp4`);

        if (!fs.existsSync(filePath)) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: `❌ Vidéo "${fileName}" introuvable.` });
        }

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                video: fs.readFileSync(filePath),
                caption: formatMessage('Médiathèque', `🎬 Archive : ${fileName}`)
            });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de lecture vidéo.' });
        }
    }
};
