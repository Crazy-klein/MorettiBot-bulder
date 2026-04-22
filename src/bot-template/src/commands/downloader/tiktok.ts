import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import axios from 'axios';

export default {
    name: 'tiktok',
    aliases: ['tt', 'ttdl'],
    description: 'Télécharge une vidéo TikTok sans filigrane',
    category: 'Downloader',
    async execute(ctx: CommandContext) {
        const url = ctx.args[0];
        if (!url) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .tiktok <lien>' });

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '📱', key: ctx.msg.key } });
            
            const res = await axios.get(`https://tikwm.com/api/?url=${url}`);
            const data = res.data.data;
            
            if (data?.play) {
                await ctx.sock.sendMessage(ctx.remoteJid, {
                    video: { url: data.play },
                    caption: formatMessage('TikTok DL', [
                        `👤 Auteur : ${data.author.nickname}`,
                        `📝 Titre : ${data.title.slice(0, 50)}...`
                    ])
                });
            } else {
                throw new Error();
            }
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Échec TikTok. Vérifiez le lien.' });
        }
    }
};
