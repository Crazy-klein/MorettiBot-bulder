import { CommandContext } from '../../types/index.js';
import { formatMessage, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase<{ enabled: boolean }>('antidelete.json');

export default {
    name: 'antidelete',
    aliases: ['ad', 'nodelete'],
    description: 'Envoie les messages supprimés dans le chat',
    category: 'Security',
    async execute(ctx: CommandContext) {
        const sub = ctx.args[0]?.toLowerCase();
        const settings = db.get(ctx.remoteJid) || { enabled: false };

        if (sub === 'on' || sub === 'off') {
            settings.enabled = sub === 'on';
            db.set(ctx.remoteJid, settings);
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Anti-Delete', `Protection ${settings.enabled ? 'activée' : 'désactivée'}.`) });
        }

        await ctx.sock.sendMessage(ctx.remoteJid, { text: `📊 État : ${settings.enabled ? 'On' : 'Off'}. Usage: .antidelete <on/off>` });
    }
};
