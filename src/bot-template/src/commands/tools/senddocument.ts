import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import fs from 'fs';
import path from 'path';

export default {
    name: 'senddocument',
    aliases: ['sdoc'],
    description: 'Envoie un document depuis le répertoire local medias/documents',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        const fileName = ctx.args[0];
        if (!fileName) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .senddocument <nom_fichier>' });

        const dir = path.join(process.cwd(), 'database', 'medias', 'documents');
        const filePath = path.join(dir, fileName);

        if (!fs.existsSync(filePath)) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: `❌ Document "${fileName}" introuvable.` });
        }

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                document: fs.readFileSync(filePath),
                fileName: fileName,
                mimetype: 'application/octet-stream'
            });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de lecture document.' });
        }
    }
};
