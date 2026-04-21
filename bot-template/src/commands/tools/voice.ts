import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export default {
    name: 'voice',
    aliases: ['voix', 'say'],
    description: 'Texte en note vocale (TTS)',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        let text = ctx.args.join(' ');
        if (ctx.quotedMessage && !text) {
            text = ctx.quotedMessage.conversation || (ctx.quotedMessage as any).extendedTextMessage?.text || (ctx.quotedMessage as any).imageMessage?.caption || '';
        }

        if (!text) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: '⚠️ Usage: .voice <texte> ou répondez à un message.' });
        }

        if (text.length > 200) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Trop long (max 200 caractères).' });
        }

        try {
            const params = new URLSearchParams({
                ie: 'UTF-8',
                q: text,
                tl: 'fr',
                client: 'tw-ob',
                ttsspeed: '1'
            });

            const ttsUrl = `https://translate.google.com/translate_tts?${params}`;

            await ctx.sock.sendMessage(ctx.remoteJid, {
                audio: { url: ttsUrl },
                mimetype: 'audio/mpeg',
                ptt: true
            });
        } catch (e) {
            console.error('Error voice:', e);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Échec.' });
        }
    }
};
