import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';
import fs from 'fs';
import path from 'path';

export default {
    name: 'delmedia',
    aliases: ['removemedia', 'clearmedia'],
    description: 'Supprime des fichiers du stockage interne',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        if (!permissions.isOwner(ctx.sender, 'YOUR_OWNER_NUMBER_HERE')) return;

        const type = ctx.args[0]; // images, videos, etc.
        const file = ctx.args[1];

        if (!type || !file) return await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Usage: .delmedia <type> <nom|all>' });

        const storageDir = path.join(process.cwd(), 'internal_storage');
        // Logique de suppression simplifiée pour le template
        await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Médiathèque', `🗑️ Action lancée sur ${file} (${type}).`) });
    }
};
