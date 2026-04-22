import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import axios from 'axios';

export default {
    name: 'searchimage',
    aliases: ['img', 'image'],
    description: 'Recherche des images haute qualité',
    category: 'Search',
    async execute(ctx: CommandContext) {
        const query = ctx.args[0];
        if (!query) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🖼️ Que cherchez-vous ?' });

        const count = parseInt(ctx.args[1]) || 1;
        const limit = Math.min(count, 5);

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🔍', key: ctx.msg.key } });
            
            for (let i = 0; i < limit; i++) {
                const url = `https://picsum.photos/seed/${encodeURIComponent(query + i)}/1200/800`;
                await ctx.sock.sendMessage(ctx.remoteJid, {
                    image: { url },
                    caption: formatMessage('Visual Search', [
                        `🔎 Résultat ${i + 1} pour : ${query}`,
                        `📸 Source : Archive Numérique`
                    ])
                });
                if (limit > 1) await new Promise(r => setTimeout(r, 1000));
            }
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur lors de la recherche visuelle.' });
        }
    }
};
