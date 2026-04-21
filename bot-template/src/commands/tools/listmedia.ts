import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import fs from 'fs';
import path from 'path';

export default {
    name: 'listmedia',
    aliases: ['lsmedia'],
    description: 'Affiche la liste des fichiers stockés sur le bot',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        const storageDir = path.join(process.cwd(), 'internal_storage');
        if (!fs.existsSync(storageDir)) return await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Stockage vide.' });

        try {
            const files = fs.readdirSync(storageDir);
            if (files.length === 0) return await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Aucun fichier.' });

            let response = '📂 *INVENTAIRE MÉDIA*\n\n';
            files.forEach((file, i) => {
                response += `${i + 1}. \`${file}\`\n`;
            });

            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Médiathèque', response) });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur.' });
        }
    }
};
