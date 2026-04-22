import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import axios from 'axios';

export default {
    name: 'facebook',
    aliases: ['fb', 'fbdl'],
    description: 'Télécharge une vidéo Facebook HD/SD',
    category: 'Downloader',
    async execute(ctx: CommandContext) {
        if (!ctx.args[0]) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🔗 Veuillez fournir un lien Facebook.' });
        
        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '📽️', key: ctx.msg.key } });
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '⏳ _Récupération du média Facebook..._' });

            // API publique realistic de téléchargement FB
            const res = await axios.get(`https://api.botcahl.com/api/download/facebook?url=${encodeURIComponent(ctx.args[0])}&apikey=72M38Kq7`).catch(() => null);
            
            const videoUrl = res?.data?.result?.hd || res?.data?.result?.sd;

            if (videoUrl) {
                await ctx.sock.sendMessage(ctx.remoteJid, { 
                    video: { url: videoUrl },
                    caption: formatMessage('FB Downloader', '✅ Vidéo Facebook prête !')
                });
            } else {
                throw new Error('Média introuvable.');
            }
        } catch (e: any) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: `❌ Erreur : ${e.message}` });
        }
    }
};
