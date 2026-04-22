import { CommandContext } from '../../types/index.js';
import { formatMessage, JSONDatabase, permissions } from '../../lib/utils.js';

const db = new JSONDatabase('autotype.json');

export default {
    name: 'autotype',
    aliases: ['automode'],
    description: 'Bascule entre le mode écriture (typing) ou enregistrement (recording)',
    category: 'Automation',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        const mode = ctx.args[0]?.toLowerCase(); // typing, recording, off
        if (['typing', 'recording'].includes(mode)) {
            db.set(ctx.remoteJid, mode);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Automation', `✅ Mode simulé : ${mode.toUpperCase()}`) });
        } else if (mode === 'off') {
            db.delete(ctx.remoteJid);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Automation', '❌ Mode simulation désactivé.') });
        } else {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .autotype <typing/recording/off>' });
        }
    }
};
