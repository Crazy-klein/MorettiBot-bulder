import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';

export default {
    name: 'tts',
    aliases: ['voice'],
    description: 'Synthèse vocale (Text to Speech)',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        let lang = 'fr';
        let text = ctx.args.join(' ');

        if (ctx.args[0]?.length === 2) {
            lang = ctx.args[0];
            text = ctx.args.slice(1).join(' ');
        }

        if (ctx.quotedMessage && !text) {
            text = (ctx.quotedMessage as any).conversation || (ctx.quotedMessage as any).extendedTextMessage?.text || '';
        }

        if (!text) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .tts [lang] <texte>' });

        try {
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.slice(0, 250))}&tl=${lang}&client=tw-ob`;
            await ctx.sock.sendMessage(ctx.remoteJid, { audio: { url }, mimetype: 'audio/mpeg', ptt: true });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de synthèse.' });
        }
    }
};
