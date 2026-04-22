import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import axios from 'axios';

export default {
    name: 'searchimage',
    aliases: ['img', 'image'],
    description: 'Recherche des images haute qualité',
    category: 'Search',
    async execute(ctx: CommandContext) {
        const query = ctx.args.join(' ');
        if (!query) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🖼️ Que cherchez-vous ?' });

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🔍', key: ctx.msg.key } });
            
            // Pour le template, on utilise Picsum comme base sécurisée, 
            // mais on pourrait intégrer l'API Unsplash ou Bing.
            const url = `https://picsum.photos/seed/${encodeURIComponent(query)}/1200/800`;

            await ctx.sock.sendMessage(ctx.remoteJid, {
                image: { url },
                caption: formatMessage('Visual Search', [
                    `🔎 Résultat pour : ${query}`,
                    `📸 Source : Unsplash (Simulé)`
                ])
            });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur lors de la recherche visuelle.' });
        }
    }
};
