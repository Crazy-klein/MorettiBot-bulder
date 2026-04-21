import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { textUtils } from '../../lib/utils.js';
import path from 'path';
import fs from 'fs';

export default {
    name: 'senddoc',
    aliases: ['sd', 'document', 'doc'],
    description: 'Envoie un document stocké localement',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        if (ctx.args.length === 0) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: '⚠️ Usage: .senddoc <nom_fichier> [--filename nouveau_nom]' });
        }

        const fileName = ctx.args[0];
        const { flags } = textUtils.parseFlags(ctx.args);
        
        // Simulé pour le template : recherche dans medias/documents
        const docMsg = formatMessage('Cloud Drive', [
            `📄 Fichier : ${fileName}`,
            `📂 Type : Document`,
            `💡 Status : Recherche en cours...`
        ]);

        await ctx.sock.sendMessage(ctx.remoteJid, { text: docMsg });
    }
};
