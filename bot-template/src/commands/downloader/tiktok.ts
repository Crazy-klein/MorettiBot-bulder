import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import axios from 'axios';

export default {
    name: 'tiktok',
    aliases: ['tt', 'ttdl'],
    description: 'Télécharge une vidéo TikTok via un lien',
    category: 'Downloader',
    async execute(ctx: CommandContext) {
        if (!ctx.args[0]) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('TikTok DL', 'Posez un lien TikTok après la commande.') 
            });
        }

        const url = ctx.args[0];

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🎵', key: ctx.msg.key } });
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '⏳ _Téléchargement de la vidéo TikTok..._' });

            // Utilisation d'une API publique simulée (tikwm.com est souvent utilisé)
            const res = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const data = res.data?.data;

            if (!data?.play) throw new Error('Vidéo introuvable.');

            await ctx.sock.sendMessage(ctx.remoteJid, { 
                video: { url: data.play },
                caption: formatMessage('TikTok DL', [
                    `👤 Auteur: ${data.author?.nickname || 'Inconnu'}`,
                    `📝 Titre: ${data.title || 'Sans titre'}`,
                    `❤️ Likes: ${data.digg_count || 0}`
                ])
            });

        } catch (e: any) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur TikTok: ' + e.message });
        }
    }
};
