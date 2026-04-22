import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase<{ enabled: boolean, text: string }>('welcome.json');

export default {
    name: 'welcome',
    aliases: ['bienvenue', 'setwelcome'],
    description: 'Gère les messages de bienvenue du groupe',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        const sub = ctx.args[0]?.toLowerCase();
        const settings = db.get(ctx.remoteJid) || { enabled: false, text: 'Bienvenue sur @group, @user !' };

        switch(sub) {
            case 'on':
                settings.enabled = true;
                db.set(ctx.remoteJid, settings);
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Welcome', '✅ Activé.') });
                break;
            case 'off':
                settings.enabled = false;
                db.set(ctx.remoteJid, settings);
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Welcome', '❌ Désactivé.') });
                break;
            case 'set':
                settings.text = ctx.args.slice(1).join(' ');
                db.set(ctx.remoteJid, settings);
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Welcome', `✅ Template mis à jour.`) });
                break;
            case 'preview':
                let msg = settings.text.replace('@user', `@${ctx.sender.split('@')[0]}`).replace('@group', 'Ce Groupe');
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Welcome Preview', msg), mentions: [ctx.sender] });
                break;
            default:
                await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .welcome <on/off/set message/preview>' });
        }
    }
};
