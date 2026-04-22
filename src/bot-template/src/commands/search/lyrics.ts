import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import axios from 'axios';

export default {
    name: 'lyrics',
    aliases: ['paroles'],
    description: 'Recherche les paroles d\'une chanson',
    category: 'Search',
    async execute(ctx: CommandContext) {
        const query = ctx.args.join(' ');
        if (!query) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🎵 Quelle chanson ?' });

        try {
            const res = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(query.split('-')[0].trim())}/${encodeURIComponent(query.split('-')[1]?.trim() || query)}`);
            if (res.data.lyrics) {
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Lyrics', res.data.lyrics.slice(0, 1500) + (res.data.lyrics.length > 1500 ? '\n...' : '')) });
            } else {
                throw new Error();
            }
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Paroles non trouvées. Essayez Format: Artiste - Chanson' });
        }
    }
};
