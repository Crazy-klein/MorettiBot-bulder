import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, JSONDatabase } from '../../lib/utils.js';

const antispamDB = new JSONDatabase<{ enabled: boolean, threshold: number }>('antispam.json');

export default {
    name: 'antispam',
    aliases: ['asmp', 'nospam'],
    description: 'Gère la protection contre le spam de messages',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        const isUserAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender);
        if (!isUserAdmin) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🚫 Réservé aux administrateurs.' });

        const subCommand = ctx.args[0]?.toLowerCase();
        const settings = antispamDB.get(ctx.remoteJid) || { enabled: false, threshold: 5 };

        switch(subCommand) {
            case 'on':
                settings.enabled = true;
                antispamDB.set(ctx.remoteJid, settings);
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Spam', '✅ Protection activée.') });
                break;
            case 'off':
                settings.enabled = false;
                antispamDB.set(ctx.remoteJid, settings);
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Spam', '❌ Protection désactivée.') });
                break;
            case 'set':
                const val = parseInt(ctx.args[1]);
                if (isNaN(val) || val < 3 || val > 20) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Valeur invalide (3-20).' });
                settings.threshold = val;
                antispamDB.set(ctx.remoteJid, settings);
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Spam', `📈 Seuil mis à jour : ${val} msgs/3s`) });
                break;
            case 'status':
                await ctx.sock.sendMessage(ctx.remoteJid, { 
                    text: formatMessage('Anti-Spam Status', [
                        `📊 État : ${settings.enabled ? 'Activé' : 'Désactivé'}`,
                        `📈 Seuil : ${settings.threshold} msgs / 3s`,
                        '🚫 Action : Avertissement + Suppression'
                    ]) 
                });
                break;
            default:
                await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .antispam <on/off/set/status> [valeur]' });
        }
    }
};
