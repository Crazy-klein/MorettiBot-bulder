import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export default {
    name: 'tts',
    aliases: ['voice', 'voix'],
    description: 'Transforme du texte en note vocale',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        let text = ctx.args.join(' ');
        if (ctx.quotedMessage && !text) {
            text = ctx.quotedMessage.conversation || (ctx.quotedMessage as any).extendedTextMessage?.text || (ctx.quotedMessage as any).imageMessage?.caption || '';
        }

        if (!text) return;

        try {
            const params = new URLSearchParams({
                ie: 'UTF-8',
                q: text,
                tl: 'fr',
                client: 'tw-ob'
            });
            const url = `https://translate.google.com/translate_tts?${params}`;

            await ctx.sock.sendMessage(ctx.remoteJid, {
                audio: { url },
                mimetype: 'audio/mpeg',
                ptt: true
            });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Échec de la synthèse vocale.' });
        }
    }
};
