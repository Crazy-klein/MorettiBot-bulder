import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase<{ enabled: boolean, limit: number }>('antitag.json');

export default {
    name: 'antitag',
    aliases: ['at', 'notag'],
    description: 'Empêche les mentions excessives',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🚫 Admin requis.' });

        const sub = ctx.args[0]?.toLowerCase();
        const settings = db.get(ctx.remoteJid) || { enabled: false, limit: 10 };

        if (sub === 'on' || sub === 'off') {
            settings.enabled = sub === 'on';
            db.set(ctx.remoteJid, settings);
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Tag', `Protection ${settings.enabled ? 'activée' : 'désactivée'}.`) });
        } else if (sub === 'set') {
            const val = parseInt(ctx.args[1]);
            if (isNaN(val)) return;
            settings.limit = val;
            db.set(ctx.remoteJid, settings);
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Tag', `Limite réglée sur ${val} mentions.`) });
        }

        await ctx.sock.sendMessage(ctx.remoteJid, { text: `📊 État : ${settings.enabled ? 'On' : 'Off'} | Limite : ${settings.limit}. Usage: .antitag <on/off/set n>` });
    }
};
