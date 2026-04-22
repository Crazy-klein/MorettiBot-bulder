import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import fs from 'fs';
import path from 'path';

export default {
    name: 'listmedia',
    aliases: ['lsmedia', 'medialist'],
    description: 'Affiche la liste des fichiers enregistrés',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        const storageDir = path.join(process.cwd(), 'database', 'media_store');
        if (!fs.existsSync(storageDir)) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: '📂 Le stockage est actuellement vide.' });
        }

        try {
            const files = fs.readdirSync(storageDir).filter(f => f.endsWith('.bin'));
            if (files.length === 0) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '📂 Aucun média enregistré.' });

            let list = '📂 *INVENTAIRE MÉDIATHÈQUE*\n\n';
            files.forEach((file, i) => {
                list += `${i + 1}. \`${file.replace('.bin', '')}\`\n`;
            });

            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Médiathèque', list) });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de lecture.' });
        }
    }
};
