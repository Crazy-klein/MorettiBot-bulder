import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';
import { config } from '../../config.js';

export default {
    name: 'sudo',
    description: 'Donne accès à des privilèges temporaires (Owner uniquement)',
    category: 'Owner',
    async execute(ctx: CommandContext) {
        if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;

        const target = ctx.mentionedJid[0];
        const duration = parseInt(ctx.args[1]);

        if (!target || isNaN(duration)) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Sudo System', 'Usage: .sudo @user <minutes>') 
            });
        }

        // Dans un vrai bot, on stockerait ça en DB
        await ctx.sock.sendMessage(ctx.remoteJid, { 
            text: formatMessage('Sudo', `@${target.split('@')[0]} a reçu des droits temporaires pour ${duration} minutes.`),
            mentions: [target]
        });
    }
};
