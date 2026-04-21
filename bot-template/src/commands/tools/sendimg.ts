import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { textUtils } from '../../lib/utils.js';

export default {
    name: 'sendimg',
    aliases: ['si', 'image_local'],
    description: 'Envoie une image stockée localement',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        if (ctx.args.length === 0) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: '⚠️ Usage: .sendimg <nom_image> [--viewonce]' });
        }

        const imgName = ctx.args[0];
        const isOnce = ctx.fullArgs.includes('--viewonce');

        await ctx.sock.sendMessage(ctx.remoteJid, { 
            text: formatMessage('Médiathèque', [
                `🖼️ Image : ${imgName}`,
                `👁️ Mode éphémère : ${isOnce ? 'Oui' : 'Non'}`,
                `⏳ Chargement du buffer...`
            ]) 
        });
    }
};
