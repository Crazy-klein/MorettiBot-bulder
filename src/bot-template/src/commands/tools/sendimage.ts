import { CommandContext } from '../../types/index.js';
import { formatMessage, mediaUtils } from '../../lib/utils.js';
import fs from 'fs';
import path from 'path';

export default {
    name: 'sendimage',
    aliases: ['sim'],
    description: 'Envoie une image depuis le répertoire local medias/images',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        const fileName = ctx.args[0];
        if (!fileName) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .sendimage <nom_fichier>' });

        const dir = path.join(process.cwd(), 'database', 'medias', 'images');
        const filePath = path.join(dir, fileName.includes('.') ? fileName : `${fileName}.jpg`);

        if (!fs.existsSync(filePath)) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: `❌ Image "${fileName}" introuvable dans medias/images.` });
        }

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                image: fs.readFileSync(filePath),
                caption: formatMessage('Médiathèque', `🖼️ Archive : ${fileName}`)
            });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de lecture du fichier.' });
        }
    }
};
