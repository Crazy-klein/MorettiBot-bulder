import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase<{ enabled: boolean }>('antidelete.json');

export default {
    name: 'antidelete',
    aliases: ['ad', 'norevoke'],
    description: 'Empêche la suppression de messages (Détection et renvoi)',
    category: 'Security',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        const isUserAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender);
        if (!isUserAdmin) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🚫 Admin requis.' });

        const sub = ctx.args[0]?.toLowerCase();
        if (sub === 'on' || sub === 'off') {
            const enabled = sub === 'on';
            db.set(ctx.remoteJid, { enabled });
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Anti-Delete', `La protection est désormais ${enabled ? '*Activée*' : '*Désactivée*'}.`) 
            });
        }

        const settings = db.get(ctx.remoteJid) || { enabled: false };
        await ctx.sock.sendMessage(ctx.remoteJid, { text: `📊 État actuel : ${settings.enabled ? 'On' : 'Off'}. Usage: .antidelete <on/off>` });
    }
};
