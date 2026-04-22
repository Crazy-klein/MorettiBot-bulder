import { CommandContext } from '../../types/index.js';
import { mediaUtils } from '../../lib/utils.js';

export default {
    name: 'vv',
    aliases: ['viewonce', 'retreive'],
    description: 'Bypass le mode "Vue Unique"',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        if (!ctx.quotedMessage) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Répondez à un message à vue unique.' });

        const quoted = ctx.quotedMessage;
        const viewOnce = quoted.viewOnceMessage || quoted.viewOnceMessageV2 || quoted.viewOnceMessageV2Extension;
        
        if (!viewOnce) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Ce message n\'est pas à vue unique.' });

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '👀', key: ctx.msg.key } });

            const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
            if (!buffer) throw new Error();

            const mediaMsg = viewOnce.message;
            if (mediaMsg?.imageMessage) {
                await ctx.sock.sendMessage(ctx.remoteJid, { image: buffer, caption: mediaMsg.imageMessage.caption });
            } else if (mediaMsg?.videoMessage) {
                await ctx.sock.sendMessage(ctx.remoteJid, { video: buffer, caption: mediaMsg.videoMessage.caption });
            } else if (mediaMsg?.audioMessage) {
                await ctx.sock.sendMessage(ctx.remoteJid, { audio: buffer, ptt: mediaMsg.audioMessage.ptt });
            }
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Échec de la récupération.' });
        }
    }
};
