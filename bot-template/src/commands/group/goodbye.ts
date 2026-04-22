import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase<{ enabled: boolean, text: string }>('goodbye.json');

export default {
    name: 'goodbye',
    aliases: ['bye', 'au-revoir'],
    description: 'Configure le message de départ des membres',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        const sub = ctx.args[0]?.toLowerCase();
        const settings = db.get(ctx.remoteJid) || { enabled: false, text: '@user nous a quitté...' };

        if (sub === 'on' || sub === 'off') {
            settings.enabled = sub === 'on';
            db.set(ctx.remoteJid, settings);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Goodbye', `✅ État : ${settings.enabled ? 'Activé' : 'Désactivé'}`) });
        } else if (sub === 'set') {
            settings.text = ctx.args.slice(1).join(' ');
            db.set(ctx.remoteJid, settings);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Goodbye', '📝 Message de départ mis à jour.') });
        } else {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .goodbye <on/off/set message>' });
        }
    }
};
