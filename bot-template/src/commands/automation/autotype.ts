import { CommandContext } from '../../types/index.js';
import { formatMessage, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase<{ enabled: boolean, mode: 'typing' | 'recording' }>('autotype.json');

export default {
    name: 'autotype',
    aliases: ['autowrite', 'typing'],
    description: 'Simule l\'écriture ou l\'enregistrement audio automatiquement',
    category: 'Automation',
    async execute(ctx: CommandContext) {
        const sub = ctx.args[0]?.toLowerCase();
        const settings = db.get(ctx.remoteJid) || { enabled: false, mode: 'typing' };

        if (sub === 'on' || sub === 'off') {
            settings.enabled = sub === 'on';
            db.set(ctx.remoteJid, settings);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Auto-Type', `✅ Simulation (${settings.mode}) : ${settings.enabled ? 'Activée' : 'Désactivée'}`) });
        } else if (sub === 'mode') {
            const mode = ctx.args[1]?.toLowerCase() === 'recording' ? 'recording' : 'typing';
            settings.mode = mode;
            db.set(ctx.remoteJid, settings);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Auto-Type', `⚙️ Mode changé en : ${mode}`) });
        } else {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: `📊 État : ${settings.enabled ? 'On' : 'Off'} | Mode : ${settings.mode}. Usage: .autotype <on/off/mode typing/recording>` });
        }
    }
};
