import { CommandContext } from '../../types/index.js';
import { permissions } from '../../lib/utils.js';
import { config } from '../../config.js';

export default {
    name: 'setprefix',
    aliases: ['prefix', 'setpref'],
    description: 'Change le préfixe général du bot (Owner uniquement)',
    category: 'Owner',
    async execute(ctx: CommandContext) {
        if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;

        const newPrefix = ctx.args[0];
        if (!newPrefix || newPrefix.length !== 1) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: '⚠️ Le préfixe doit être un seul caractère.' });
        }

        // Note: Dans une version réelle, on mettrait à jour un fichier JSON ou une DB.
        // Ici nous confirmons l'action pour le template.
        await ctx.sock.sendMessage(ctx.remoteJid, { text: `✅ Préfixe changé en : \`${newPrefix}\`` });
    }
};
