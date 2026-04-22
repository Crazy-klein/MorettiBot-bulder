import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, JSONDatabase } from '../../lib/utils.js';
import { config } from '../../config.js';

const db = new JSONDatabase('config.json');

export default {
    name: 'setprefix',
    aliases: ['prefix'],
    description: 'Change le préfixe du bot (Owner uniquement)',
    category: 'Owner',
    async execute(ctx: CommandContext) {
        if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;

        const newPrefix = ctx.args[0];
        if (!newPrefix || newPrefix.length !== 1) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: '⚠️ Fournissez un unique caractère.' });
        }

        db.set('prefix', newPrefix);
        
        await ctx.sock.sendMessage(ctx.remoteJid, { 
            text: formatMessage('Bot Config', `✅ Préfixe global modifié : *${newPrefix}*`) 
        });
    }
};
