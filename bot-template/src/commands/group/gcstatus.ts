import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions, mediaUtils, miscUtils } from '../../lib/utils.js';
import { downloadContentFromMessage, prepareWAMessageMedia } from '@whiskeysockets/baileys';

export default {
    name: 'gcstatus',
    aliases: ['statusgp'],
    description: 'Envoie un statut dans le groupe (texte, image, vidéo, audio).',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;

        const isUserAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender);
        if (!isUserAdmin) return;

        let msgText = ctx.args.join(' ').trim();
        const quoted = ctx.quotedMessage;

        if (!msgText && quoted) {
            msgText = quoted.conversation || (quoted as any).extendedTextMessage?.text || '';
        }

        let statusPayload: any = null;

        try {
            // Logique pour les médias cités
            if (quoted?.imageMessage) {
                const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
                if (buffer) {
                    const media = await prepareWAMessageMedia({ image: buffer }, { upload: ctx.sock.waUploadToServer });
                    statusPayload = {
                        groupStatusMessageV2: {
                            message: {
                                imageMessage: {
                                    ...media.imageMessage,
                                    caption: quoted.imageMessage.caption || ''
                                }
                            }
                        }
                    };
                }
            } else if (quoted?.videoMessage) {
                const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
                if (buffer) {
                    const media = await prepareWAMessageMedia({ video: buffer }, { upload: ctx.sock.waUploadToServer });
                    statusPayload = {
                        groupStatusMessageV2: {
                            message: {
                                videoMessage: {
                                    ...media.videoMessage,
                                    caption: quoted.videoMessage.caption || ''
                                }
                            }
                        }
                    };
                }
            } else if (quoted?.audioMessage) {
                const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
                if (buffer) {
                    const media = await prepareWAMessageMedia({ audio: buffer }, { upload: ctx.sock.waUploadToServer });
                    statusPayload = {
                        groupStatusMessageV2: {
                            message: {
                                audioMessage: {
                                    ...media.audioMessage,
                                    ptt: quoted.audioMessage.ptt || false
                                }
                            }
                        }
                    };
                }
            } else if (msgText) {
                // Statut texte simple
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

            if (!statusPayload) {
                return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Veuillez répondre à un média ou fournir un texte.' });
            }

            await ctx.sock.relayMessage(ctx.remoteJid, statusPayload, {});
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '✅', key: ctx.msg.key } });

        } catch (e) {
            console.error('Error gcstatus:', e);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Échec de l\'envoi du statut.' });
        }
    }
};
