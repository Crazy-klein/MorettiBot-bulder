import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase<{ enabled: boolean, threshold: number }>('antispam.json');

export default {
    name: 'antispam',
    aliases: ['as', 'nospam'],
    description: 'Empêche le spam dans le groupe',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🚫 Admin requis.' });

        const sub = ctx.args[0]?.toLowerCase();
        const settings = db.get(ctx.remoteJid) || { enabled: false, threshold: 5 };

        if (sub === 'on' || sub === 'off') {
            settings.enabled = sub === 'on';
            db.set(ctx.remoteJid, settings);
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Spam', `Protection ${settings.enabled ? 'activée' : 'désactivée'}.`) });
        } else if (sub === 'set') {
            const val = parseInt(ctx.args[1]);
            if (isNaN(val)) return;
            settings.threshold = val;
            db.set(ctx.remoteJid, settings);
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Spam', `Seuil réglé sur ${val} messages/sec.`) });
        }

        await ctx.sock.sendMessage(ctx.remoteJid, { text: `📊 État : ${settings.enabled ? 'On' : 'Off'} | Seuil : ${settings.threshold}. Usage: .antispam <on/off/set n>` });
    }
};
