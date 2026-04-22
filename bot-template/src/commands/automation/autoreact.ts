import { CommandContext } from '../../types/index.js';
import { formatMessage, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase<{ enabled: boolean }>('autoreact.json');

export default {
    name: 'autoreact',
    aliases: ['autors', 'reactauto'],
    description: 'Gère les réactions automatiques sur les messages',
    category: 'Automation',
    async execute(ctx: CommandContext) {
        const sub = ctx.args[0]?.toLowerCase();
        const settings = db.get(ctx.remoteJid) || { enabled: false };

        if (sub === 'on') {
            settings.enabled = true;
            db.set(ctx.remoteJid, settings);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Auto-React', '✅ Activé pour ce chat.') });
        } else if (sub === 'off') {
            settings.enabled = false;
            db.set(ctx.remoteJid, settings);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Auto-React', '❌ Désactivé.') });
        } else {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: `📊 État : ${settings.enabled ? 'On' : 'Off'}. Usage: .autoreact <on/off>` });
        }
    }
};
