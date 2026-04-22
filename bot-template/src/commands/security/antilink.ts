import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, JSONDatabase } from '../../lib/utils.js';

const antilinkDB = new JSONDatabase<{ enabled: boolean, action: 'kick' | 'delete' | 'warn' }>('antilink.json');

export default {
    name: 'antilink',
    aliases: ['alnk'],
    description: 'Empêche l\'envoi de liens WhatsApp dans le groupe',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        const isUserAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender);
        if (!isUserAdmin) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🚫 Réservé aux administrateurs.' });

        const subCommand = ctx.args[0]?.toLowerCase();
        const settings = antilinkDB.get(ctx.remoteJid) || { enabled: false, action: 'delete' };

        switch(subCommand) {
            case 'on':
                settings.enabled = true;
                antilinkDB.set(ctx.remoteJid, settings);
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Link', '✅ Protection activée.') });
                break;
            case 'off':
                settings.enabled = false;
                antilinkDB.set(ctx.remoteJid, settings);
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Link', '❌ Protection désactivée.') });
                break;
            case 'set':
                const action = ctx.args[1]?.toLowerCase();
                if (action !== 'kick' && action !== 'delete' && action !== 'warn') {
                    return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Action invalide (kick/delete/warn).' });
                }
                settings.action = action as any;
                antilinkDB.set(ctx.remoteJid, settings);
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Link', `⚙️ Action mise à jour : ${action}`) });
                break;
            case 'status':
                await ctx.sock.sendMessage(ctx.remoteJid, { 
                    text: formatMessage('Anti-Link Status', [
                        `📊 État : ${settings.enabled ? 'Activé' : 'Désactivé'}`,
                        `🚫 Action : ${settings.action.toUpperCase()}`,
                        '🔗 Cible : Liens WhatsApp/Groupes'
                    ]) 
                });
                break;
            default:
                await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .antilink <on/off/set/status> [action]' });
        }
    }
};
