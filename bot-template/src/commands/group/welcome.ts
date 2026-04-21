import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export default {
    name: 'welcome',
    aliases: ['bienvenue', 'setwelcome'],
    description: 'Gère les messages de bienvenue du groupe',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        const sub = ctx.args[0]?.toLowerCase();
        
        switch(sub) {
            case 'on':
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Welcome', '✅ Messages de bienvenue activés.') });
                break;
            case 'off':
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Welcome', '❌ Messages de bienvenue désactivés.') });
                break;
            case 'set':
                const template = ctx.args.slice(1).join(' ');
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Welcome', `📝 Template défini :\n"${template}"`) });
                break;
            case 'preview':
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Welcome Preview', 'Ceci est un exemple de message de bienvenue.') });
                break;
            default:
                await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Usage: .welcome <on/off/set template/preview>' });
        }
    }
};
