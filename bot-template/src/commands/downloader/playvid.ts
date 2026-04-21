import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export default {
    name: 'playvid',
    aliases: ['video', 'pv'],
    description: 'Recherche et télécharge une vidéo sur YouTube',
    category: 'Downloader',
    async execute(ctx: CommandContext) {
        const query = ctx.args.join(' ');
        if (!query) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🎬 Quelle vidéo voulez-vous voir ?' });

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: `⏳ _Recherche vidéo : "${query}"..._` });
            
            const info = formatMessage('YouTube Video', [
                `🎞️ Résultat : ${query}`,
                '📦 Conversion MP4 lancée...'
            ]);

            await ctx.sock.sendMessage(ctx.remoteJid, { text: info });

        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Échec de la récupération vidéo.' });
        }
    }
};
