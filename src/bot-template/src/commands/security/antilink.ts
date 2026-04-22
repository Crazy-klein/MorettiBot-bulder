import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase<{ enabled: boolean, action: 'kick' | 'delete' | 'warn' }>('antilink.json');

export default {
    name: 'antilink',
    aliases: ['al', 'nolink'],
    description: 'Empêche l\'envoi de liens WhatsApp/Internet',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🚫 Admin requis.' });

        const sub = ctx.args[0]?.toLowerCase();
        const settings = db.get(ctx.remoteJid) || { enabled: false, action: 'delete' };

        if (sub === 'on' || sub === 'off') {
            settings.enabled = sub === 'on';
            db.set(ctx.remoteJid, settings);
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Link', `Protection ${settings.enabled ? 'activée' : 'désactivée'}.`) });
        } else if (sub === 'set') {
            const action = ctx.args[1] as any;
            if (!['kick', 'delete', 'warn'].includes(action)) return;
            settings.action = action;
            db.set(ctx.remoteJid, settings);
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Link', `Action réglée sur : ${action}`) });
        }

        await ctx.sock.sendMessage(ctx.remoteJid, { text: `📊 Étut : ${settings.enabled ? 'On' : 'Off'} | Action : ${settings.action}. Usage: .antilink <on/off/set kick/delete/warn>` });
    }
};
