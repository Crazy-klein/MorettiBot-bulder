import { CommandContext } from '../../types/index.js';
import { permissions } from '../../lib/utils.js';
import { config } from '../../config.js';
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import path from 'path';
import fs from 'fs';

export default {
    name: 'setmenuvideo',
    aliases: ['setvideo', 'menuvideo'],
    description: 'Change la vidéo du menu (Owner uniquement)',
    category: 'Owner',
    async execute(ctx: CommandContext) {
        if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;

        if (!ctx.quotedMessage?.videoMessage) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: '⚠️ Répondez à une vidéo pour l\'utiliser comme fond de menu.' });
        }

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '💾', key: ctx.msg.key } });

            const buffer = await downloadMediaMessage(ctx.msg, 'buffer', {});
            const outputPath = path.join(process.cwd(), 'assets', 'menu_video.mp4');

            fs.writeFileSync(outputPath, buffer as Buffer);

            await ctx.sock.sendMessage(ctx.remoteJid, { text: '✅ Vidéo du menu mise à jour avec succès !' });

        } catch (e) {
            console.error('SetMenuVideo Error:', e);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur lors de l\'enregistrement.' });
        }
    }
};
