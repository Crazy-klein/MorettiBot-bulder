import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { mediaUtils } from '../../lib/utils.js';
import fs from 'fs';
import path from 'path';

export default {
    name: 'store',
    aliases: ['enregistrer'],
    description: 'Enregistre le média cité dans le stockage interne du bot',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        if (!ctx.quotedMessage) return;
        const fileName = ctx.args[0];
        if (!fileName) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Nom de fichier requis.' });

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '⏳ _Enregistrement média..._' });
            const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
            if (!buffer) return;

            const storageDir = path.join(process.cwd(), 'internal_storage');
            if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir);

            const filePath = path.join(storageDir, fileName);
            fs.writeFileSync(filePath, buffer);

            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Stockage', `Fichier "${fileName}" enregistré avec succès.`) 
            });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de stockage.' });
        }
    }
};
