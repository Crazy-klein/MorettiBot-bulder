import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase<{ enabled: boolean }>('antisticker.json');

export default {
    name: 'antisticker',
    aliases: ['as', 'nosticker'],
    description: 'Empêche l\'envoi massif de stickers',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🚫 Admin requis.' });

        const sub = ctx.args[0]?.toLowerCase();
        const settings = db.get(ctx.remoteJid) || { enabled: false };

        if (sub === 'on' || sub === 'off') {
            settings.enabled = sub === 'on';
            db.set(ctx.remoteJid, settings);
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Sticker', `Protection ${settings.enabled ? 'activée' : 'désactivée'}.`) });
        }

        await ctx.sock.sendMessage(ctx.remoteJid, { text: `📊 État : ${settings.enabled ? 'On' : 'Off'}. Usage: .antisticker <on/off>` });
    }
};
