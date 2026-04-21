import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export default {
    name: 'ai',
    aliases: ['chat', 'bot'],
    description: 'Posez une question à l\'intelligence artificielle',
    category: 'AI',
    async execute(ctx: CommandContext) {
        if (!ctx.args.length) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('IA Kurona', 'Veuillez poser votre question.') 
            });
        }

        const query = ctx.args.join(' ');

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '🤔 _Réflexion en cours..._' });

            // Note: Normalement ici on utilise le SDK Gemini via process.env.GEMINI_API_KEY
            // Mais pour le template, on laisse une structure compatible
            
            const responseText = `[AI Kurona] Vous avez demandé : "${query}". Cette réponse est générée par le système intégré du bot.`;

            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Réponse IA', responseText) 
            });

        } catch (e: any) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur IA: ' + e.message });
        }
    }
};
