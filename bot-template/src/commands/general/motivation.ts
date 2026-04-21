import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export default {
    name: 'motivation',
    aliases: ['quote', 'inspire'],
    description: 'Envoie un message de motivation aléatoire',
    category: 'General',
    async execute(ctx: CommandContext) {
        const quotes = [
            "Le succès, c'est tomber sept fois, se relever huit.",
            "N'attends pas. Le moment parfait n'arrivera jamais.",
            "Crois en toi et tu seras invincible.",
            "Ton seul obstacle, c'est toi.",
            "Agis comme s'il était impossible d'échouer."
        ];

        const random = quotes[Math.floor(Math.random() * quotes.length)];
        await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Motivation ⚔️', random) });
    }
};
