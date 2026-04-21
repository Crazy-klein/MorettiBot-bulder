import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export default {
    name: 'sendstk',
    aliases: ['ss', 'sticker_local', 'stk'],
    description: 'Envoie un sticker stocké localement',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        if (ctx.args.length === 0) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: '⚠️ Usage: .sendstk <nom_sticker>' });
        }

        const stkName = ctx.args[0];
        await ctx.sock.sendMessage(ctx.remoteJid, { 
            text: formatMessage('Pack Sticker', [
                `🎭 Sticker : ${stkName}`,
                `✨ Dossier : medias/stickers`,
                `🚀 Envoi...`
            ]) 
        });
    }
};
