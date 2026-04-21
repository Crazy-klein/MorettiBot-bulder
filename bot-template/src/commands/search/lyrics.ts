import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import axios from 'axios';

export default {
    name: 'lyrics',
    aliases: ['paroles'],
    description: 'Recherche les paroles d\'une chanson',
    category: 'Search',
    async execute(ctx: CommandContext) {
        const query = ctx.args.join(' ');
        if (!query) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Lyrics', 'Usage: .lyrics <nom de la chanson>') 
            });
        }

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '🔍 _Recherche des paroles..._' });
            
            const res = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(query)}`);
            const lyrics = res.data.lyrics;

            if (!lyrics) throw new Error('Paroles non trouvées.');

            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage(`Paroles: ${query}`, lyrics.substring(0, 3000), '© Lyrics Service')
            });

        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Lyrics', '❌ Impossible de trouver les paroles pour cette chanson.') 
            });
        }
    }
};
