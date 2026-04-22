import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import fs from 'fs';
import path from 'path';

export default {
    name: 'sendsticker',
    aliases: ['sstk'],
    description: 'Envoie un sticker depuis le répertoire local medias/stickers',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        const fileName = ctx.args[0];
        if (!fileName) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .sendsticker <nom_fichier>' });

        const dir = path.join(process.cwd(), 'database', 'medias', 'stickers');
        const filePath = path.join(dir, fileName.includes('.') ? fileName : `${fileName}.webp`);

        if (!fs.existsSync(filePath)) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: `❌ Sticker "${fileName}" introuvable.` });
        }

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                sticker: fs.readFileSync(filePath)
            });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de lecture sticker.' });
        }
    }
};
