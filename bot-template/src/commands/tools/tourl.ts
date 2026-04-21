import { CommandContext } from '../../types/index.js';
import { mediaUtils } from '../../lib/utils.js';

export default {
    name: 'tourl',
    aliases: ['upload', 'url'],
    description: 'Convertit un média en lien permanent (Catbox)',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        if (!ctx.quotedMessage && !ctx.mediaType) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Répondez à un média.' });
        }

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '⏳ _Upload en cours..._' });
            
            const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
            if (!buffer) return;

            const url = await mediaUtils.getUrlFromMedia(buffer, ctx.mediaType || 'bin');
            
            if (url) {
                await ctx.sock.sendMessage(ctx.remoteJid, { 
                    text: `✅ *Upload réussi*\n\n🔗 Lien: ${url}\n📊 Taille: ${(buffer.length/1024/1024).toFixed(2)} MB`
                });
            } else {
                throw new Error('Upload failed');
            }

        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de conversion en URL.' });
        }
    }
};
