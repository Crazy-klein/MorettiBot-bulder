import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions } from '../../lib/utils.js';
import { config } from '../../config.js';
import fs from 'fs';
import path from 'path';

export default {
    name: 'delmedia',
    aliases: ['removemedia', 'clearmedia'],
    description: 'Supprime un fichier du stockage interne (Owner)',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;

        const fileName = ctx.args[0];
        if (!fileName) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .delmedia <nom_fichier>' });

        const storageDir = path.join(process.cwd(), 'database', 'media_store');
        const filePath = path.join(storageDir, fileName.endsWith('.bin') ? fileName : `${fileName}.bin`);

        try {
            if (!fs.existsSync(filePath)) {
                return await ctx.sock.sendMessage(ctx.remoteJid, { text: `❌ Fichier "${fileName}" introuvable.` });
            }

            fs.unlinkSync(filePath);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Médiathèque', `🗑️ Fichier "${fileName}" supprimé.`) });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de suppression.' });
        }
    }
};
