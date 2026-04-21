import { CommandContext } from '../../types/index.js';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
    name: 'vv',
    aliases: ['vu', 'retreive', 'viewonce'],
    description: 'Récupère et renvoie un message à vue unique',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        if (!ctx.quotedMessage) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Répondez à un message à vue unique.' });

        const quoted = ctx.quotedMessage;
        const isViewOnce = quoted.viewOnceMessage || quoted.viewOnceMessageV2 || quoted.viewOnceMessageV2Extension;

        if (!isViewOnce) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Ce message n\'est pas un message à vue unique.' });

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '👀', key: ctx.msg.key } });

            // On reconstruit un message minimal pour downloadMediaMessage
            const mediaMsg = isViewOnce.message;
            const type = Object.keys(mediaMsg)[0];
            
            const buffer = await downloadMediaMessage(
                { key: ctx.msg.message?.extendedTextMessage?.contextInfo?.stanzaId as any, message: mediaMsg },
                'buffer',
                {}
            );

            if (type === 'imageMessage') {
                await ctx.sock.sendMessage(ctx.remoteJid, { image: buffer as Buffer, caption: mediaMsg.imageMessage.caption });
            } else if (type === 'videoMessage') {
                await ctx.sock.sendMessage(ctx.remoteJid, { video: buffer as Buffer, caption: mediaMsg.videoMessage.caption });
            } else if (type === 'audioMessage') {
                await ctx.sock.sendMessage(ctx.remoteJid, { audio: buffer as Buffer, ptt: mediaMsg.audioMessage.ptt });
            }

        } catch (e) {
            console.error('VV Error:', e);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Échec de la récupération du média.' });
        }
    }
};
