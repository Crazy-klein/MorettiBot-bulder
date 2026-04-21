import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export default {
    name: 'sendvid',
    aliases: ['sv', 'video_local'],
    description: 'Envoie une vidéo stockée localement',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        if (ctx.args.length === 0) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: '⚠️ Usage: .sendvid <nom_video> [--ptv] [--viewonce]' });
        }

        const vidName = ctx.args[0];
        const isCircular = ctx.fullArgs.includes('--ptv');
        const isOnce = ctx.fullArgs.includes('--viewonce');

        await ctx.sock.sendMessage(ctx.remoteJid, { 
            text: formatMessage('Vidéo Center', [
                `🎞️ Vidéo : ${vidName}`,
                `🔴 Mode Circulaire : ${isCircular ? 'Oui' : 'Non'}`,
                `👁️ Mode Éphémère : ${isOnce ? 'Oui' : 'Non'}`
            ]) 
        });
    }
};
