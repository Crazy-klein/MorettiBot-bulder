import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export default {
    name: 'ai',
    description: 'Discuter avec l\'IA',
    category: 'AI',
    async execute(ctx: CommandContext) {
        if (ctx.args.length === 0) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('AI Helper', 'Veuillez poser une question.\nExemple: .ai Qu\'est-ce que KuronaBot ?') 
            });
        }

        const query = ctx.args.join(' ');
        
        // Simulation d'appel IA (dans un vrai bot, on appellerait une API Gemini par ex)
        const responseText = `Ceci est une réponse simulée de l'intelligence artificielle pour votre question : "${query}".`;

        const response = formatMessage('Kurona AI', responseText);
        
        await ctx.sock.sendMessage(ctx.remoteJid, { text: response });
    }
};
