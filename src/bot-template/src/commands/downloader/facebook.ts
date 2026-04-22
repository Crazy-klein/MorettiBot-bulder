import { CommandContext } from '../../types/index.js';
import { formatMessage, mediaUtils } from '../../lib/utils.js';
import axios from 'axios';

export default {
    name: 'facebook',
    aliases: ['fb', 'fbdl'],
    description: 'Télécharge une vidéo Facebook',
    category: 'Downloader',
    async execute(ctx: CommandContext) {
        const url = ctx.args[0];
        if (!url) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .fb <lien_video>' });

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '📽️', key: ctx.msg.key } });
            
            const res = await axios.get(`https://api.botcahl.com/api/download/fb?url=${url}&apikey=83798935`);
            if (res.data?.result?.url) {
                await ctx.sock.sendMessage(ctx.remoteJid, {
                    video: { url: res.data.result.url },
                    caption: formatMessage('Facebook DL', '✅ Vidéo récupérée avec succès.')
                });
            } else {
                throw new Error();
            }
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Échec du téléchargement Facebook.' });
        }
    }
};
