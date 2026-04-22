import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export default {
    name: 'ai',
    aliases: ['bot', 'kurona'],
    description: 'Pose une question à l\'intelligence artificielle',
    category: 'AI',
    async execute(ctx: CommandContext) {
        const query = ctx.text;
        if (!query) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🤔 Posez-moi une question !' });

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '⏳ _Kurona réfléchit..._' });
            const result = await model.generateContent(query);
            const response = await result.response;
            const textIdx = response.text();
            
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Kurona AI', textIdx) });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur avec l\'IA.' });
        }
    }
};
