import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default {
    name: 'ai',
    aliases: ['chat', 'bot', 'kurona'],
    description: 'Posez une question à l\'intelligence artificielle Kurona',
    category: 'AI',
    async execute(ctx: CommandContext) {
        if (!ctx.args.length && !ctx.quotedMessage) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('IA Kurona', 'Veuillez poser votre question.') 
            });
        }

        const query = ctx.args.join(' ') || (ctx.quotedMessage?.conversation || (ctx.quotedMessage as any)?.extendedTextMessage?.text || '');

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🧠', key: ctx.msg.key } });

            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Tu es KuronaBot, un bot WhatsApp puissant et stylé. Réponds de façon concise et cool. Question : ${query}`;
            
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('IA Kurona', responseText) 
            }, { quoted: ctx.msg });

        } catch (e: any) {
            console.error('AI Error:', e);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur IA: ' + e.message });
        }
    }
};
