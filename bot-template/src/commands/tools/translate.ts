import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import axios from 'axios';

export default {
    name: 'translate',
    aliases: ['trad', 'trt'],
    description: 'Traduit un texte dans une langue spécifiée',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        let text = ctx.args.slice(1).join(' ');
        let lang = ctx.args[0];

        if (ctx.quotedMessage) {
            text = ctx.quotedMessage.conversation || (ctx.quotedMessage as any).extendedTextMessage?.text || (ctx.quotedMessage as any).imageMessage?.caption || '';
            lang = ctx.args[0] || 'fr';
        }

        if (!text || !lang) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Translate', 'Usage: .translate <lang> <texte> ou répondez à un message avec .translate <lang>') 
            });
        }

        try {
            const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`);
            const translated = res.data[0].map((x: any) => x[0]).join('');

            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage(`Traduction (${lang.toUpperCase()})`, translated) 
            });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de traduction.' });
        }
    }
};
