import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export default {
    name: 'antispam',
    aliases: ['asmp', 'nospam'],
    description: 'Gère la protection contre le spam de messages',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        const isUserAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender);
        if (!isUserAdmin) return;

        const subCommand = ctx.args[0]?.toLowerCase();
        
        // Simulé pour le template (nécessiterait une DB pour la persistance)
        switch(subCommand) {
            case 'on':
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Spam', '✅ Protection activée.') });
                break;
            case 'off':
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Spam', '❌ Protection désactivée.') });
                break;
            case 'status':
                await ctx.sock.sendMessage(ctx.remoteJid, { 
                    text: formatMessage('Anti-Spam Status', [
                        '📊 État: Activé',
                        '📈 Seuil: 5 msgs / 3s',
                        '🚫 Action: Avertissement'
                    ]) 
                });
                break;
            default:
                await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Usage: .antispam <on/off/status>' });
        }
    }
};
