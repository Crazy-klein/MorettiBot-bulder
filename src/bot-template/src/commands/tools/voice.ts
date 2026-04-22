import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';

export default {
    name: 'voice',
    aliases: ['say', 'voix'],
    description: 'Transforme un texte en note vocale',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        let text = ctx.args.join(' ');
        if (!text && ctx.quotedMessage) {
            text = (ctx.quotedMessage as any).conversation || (ctx.quotedMessage as any).extendedTextMessage?.text || '';
        }

        if (!text) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .voice <texte>' });

        try {
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.slice(0, 200))}&tl=fr&client=tw-ob`;
            
            await ctx.sock.sendMessage(ctx.remoteJid, {
                audio: { url },
                mimetype: 'audio/mpeg',
                ptt: true
            });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur TTS.' });
        }
    }
};
