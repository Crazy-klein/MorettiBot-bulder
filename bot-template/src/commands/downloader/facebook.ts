import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import axios from 'axios';

export default {
    name: 'facebook',
    aliases: ['fb', 'fbdl'],
    description: 'Télécharge une vidéo Facebook',
    category: 'Downloader',
    async execute(ctx: CommandContext) {
        if (!ctx.args[0]) return;
        
        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '⏳ _Récupération de la vidéo Facebook..._' });
            // Simulation d'extraction
            const res = await axios.get(`https://api.example.com/fb?url=${encodeURIComponent(ctx.args[0])}`).catch(() => null);
            
            if (res?.data?.url) {
                await ctx.sock.sendMessage(ctx.remoteJid, { 
                    video: { url: res.data.url },
                    caption: formatMessage('FB Downloader', 'Vidéo téléchargée avec succès.')
                });
            } else {
                throw new Error('Url non trouvée');
            }
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Échec du téléchargement Facebook.' });
        }
    }
};
