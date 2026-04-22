import { CommandContext } from '../../types/index.js';
import { formatMessage, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase<{ enabled: boolean, like: boolean }>('autovu.json');

export default {
    name: 'autovu',
    aliases: ['autovustatut', 'readstatus'],
    description: 'Visionne automatiquement les statuts et peut envoyer des likes',
    category: 'Automation',
    async execute(ctx: CommandContext) {
        const sub = ctx.args[0]?.toLowerCase();
        const settings = db.get('global') || { enabled: false, like: false };

        if (sub === 'on' || sub === 'off') {
            settings.enabled = sub === 'on';
            db.set('global', settings);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Auto-Vu', `✅ Visionnage automatique : ${settings.enabled ? 'Activé' : 'Désactivé'}`) });
        } else if (sub === 'like') {
            settings.like = ctx.args[1]?.toLowerCase() === 'on';
            db.set('global', settings);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Auto-Vu', `💖 Like automatique : ${settings.like ? 'Activé' : 'Désactivé'}`) });
        } else {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: `📊 État global : ${settings.enabled ? 'On' : 'Off'} | Likes : ${settings.like ? 'On' : 'Off'}. Usage: .autovu <on/off/like on/like off>` });
        }
    }
};
