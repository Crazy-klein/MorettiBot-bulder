import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export default {
    name: 'searchimage',
    aliases: ['si', 'img', 'image'],
    description: 'Recherche des images sur Google',
    category: 'Search',
    async execute(ctx: CommandContext) {
        const query = ctx.args.join(' ');
        if (!query) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🖼️ Que voulez-vous chercher ?' });

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: `⏳ _Recherche d'images pour "${query}"..._` });

            // Simulation d'images pour le template (Utilise Picsum pour la démo)
            const count = parseInt(ctx.args[ctx.args.length - 1]) || 1;
            const limit = Math.min(count, 5);

            for (let i = 0; i < limit; i++) {
                await ctx.sock.sendMessage(ctx.remoteJid, {
                    image: { url: `https://picsum.photos/seed/${query}${i}/800/600` },
                    caption: formatMessage('Google Image', `Résultat ${i + 1} pour : ${query}`)
                });
            }
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de recherche.' });
        }
    }
};
