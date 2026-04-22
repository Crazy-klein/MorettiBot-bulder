import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import axios from 'axios';

export default {
    name: 'translate',
    aliases: ['tr', 'traduction'],
    description: 'Traduit un texte dans une langue cible',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        let lang = ctx.args[0] || 'fr';
        let text = ctx.args.slice(1).join(' ');

        if (!text && ctx.quotedMessage) {
            text = ctx.quotedMessage.conversation || (ctx.quotedMessage as any).extendedTextMessage?.text || '';
        }

        if (!text) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .translate <lang> <texte>' });

        try {
            const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`);
            const traduction = res.data[0].map((s: any) => s[0]).join('');

            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Traducteur', [
                    `🌍 Langue : ${lang.toUpperCase()}`,
                    `✍️ Résultat :`,
                    traduction
                ])
            });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de traduction.' });
        }
    }
};
