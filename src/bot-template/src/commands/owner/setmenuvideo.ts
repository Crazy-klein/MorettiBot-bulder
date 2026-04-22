import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, mediaUtils } from '../../lib/utils.js';
import { config } from '../../config.js';
import path from 'path';
import fs from 'fs';

export default {
    name: 'setmenuvideo',
    aliases: ['setvideo'],
    description: 'Change la vidéo du menu (Owner uniquement)',
    category: 'Owner',
    async execute(ctx: CommandContext) {
        if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;

        const isVideo = ctx.mediaType === 'video' || Object.keys(ctx.quotedMessage || {}).includes('videoMessage');
        if (!isVideo) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '⚠️ Répondez à une vidéo.' });

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🎥', key: ctx.msg.key } });

            const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
            const assetsDir = path.join(process.cwd(), 'database', 'assets');
            if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

            const outputPath = path.join(assetsDir, 'menu_video.mp4');
            fs.writeFileSync(outputPath, buffer as Buffer);

            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Bot Design', '✅ Vidéo du menu mise à jour.') });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de sauvegarde vidéo.' });
        }
    }
};
