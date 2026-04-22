import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, mediaUtils, miscUtils } from '../../lib/utils.js';
import { prepareWAMessageMedia } from '@whiskeysockets/baileys';

export default {
    name: 'gcstatus',
    aliases: ['statusgp'],
    description: 'Envoie un statut dans le groupe (texte, image, vidéo, audio).',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;

        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        let msgText = ctx.args.join(' ').trim();
        const quoted = ctx.quotedMessage;

        if (!msgText && quoted) {
            msgText = (quoted as any).conversation || (quoted as any).extendedTextMessage?.text || '';
        }

        let statusPayload: any = null;

        try {
            const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
            
            if (quoted?.imageMessage && buffer) {
                const media = await prepareWAMessageMedia({ image: buffer }, { upload: ctx.sock.waUploadToServer });
                statusPayload = { groupStatusMessageV2: { message: { imageMessage: { ...media.imageMessage, caption: quoted.imageMessage.caption || '' } } } };
            } else if (quoted?.videoMessage && buffer) {
                const media = await prepareWAMessageMedia({ video: buffer }, { upload: ctx.sock.waUploadToServer });
                statusPayload = { groupStatusMessageV2: { message: { videoMessage: { ...media.videoMessage, caption: quoted.videoMessage.caption || '' } } } };
            } else if (quoted?.audioMessage && buffer) {
                const media = await prepareWAMessageMedia({ audio: buffer }, { upload: ctx.sock.waUploadToServer });
                statusPayload = { groupStatusMessageV2: { message: { audioMessage: { ...media.audioMessage, ptt: quoted.audioMessage.ptt || false } } } };
            } else if (msgText) {
                statusPayload = {
                    groupStatusMessageV2: {
                        message: {
                            extendedTextMessage: {
                                text: msgText,
                                backgroundArgb: miscUtils.randomARGB(),
                                font: 1
                            }
                        }
                    }
                };
            }

            if (!statusPayload) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Cite d\'abord un média ou fournis un texte.' });

            await ctx.sock.relayMessage(ctx.remoteJid, statusPayload, {});
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '✅', key: ctx.msg.key } });

        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Échec de diffusion du statut.' });
        }
    }
};
