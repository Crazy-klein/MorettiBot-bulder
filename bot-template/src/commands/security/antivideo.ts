import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase<{ enabled: boolean }>('antivideo.json');

export default {
    name: 'antivideo',
    aliases: ['av', 'novideo'],
    description: 'Empêche l\'envoi de vidéos dans le groupe',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🚫 Admin requis.' });

        const sub = ctx.args[0]?.toLowerCase();
        const settings = db.get(ctx.remoteJid) || { enabled: false };

        if (sub === 'on' || sub === 'off') {
            settings.enabled = sub === 'on';
            db.set(ctx.remoteJid, settings);
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Vidéo', `Protection ${settings.enabled ? 'activée' : 'désactivée'}.`) });
        }

        await ctx.sock.sendMessage(ctx.remoteJid, { text: `📊 État : ${settings.enabled ? 'On' : 'Off'}. Usage: .antivideo <on/off>` });
    }
};
