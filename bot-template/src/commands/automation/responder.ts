import { CommandContext } from '../../types/index.js';
import { formatMessage, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase<Record<string, string>>('responder.json');

export default {
    name: 'responder',
    aliases: ['mr', 'auto-reply'],
    description: 'Gère les réponses automatiques personnalisées',
    category: 'Automation',
    async execute(ctx: CommandContext) {
        const sub = ctx.args[0]?.toLowerCase();
        const responses = db.get(ctx.remoteJid) || {};

        switch(sub) {
            case 'add':
                const key = ctx.args[1]?.toLowerCase();
                const value = ctx.args.slice(2).join(' ') || (ctx.quotedMessage?.conversation || (ctx.quotedMessage as any)?.extendedTextMessage?.text);
                
                if (!key || !value) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Usage: .responder add <mot> <réponse>' });
                
                responses[key] = value;
                db.set(ctx.remoteJid, responses);
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Responder', `✅ Réponse ajoutée pour : *${key}*`) });
                break;
            case 'list':
                const keys = Object.keys(responses);
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Responder List', keys.length ? keys.join('\n') : 'Aucune réponse configurée.') });
                break;
            case 'del':
                const word = ctx.args[1]?.toLowerCase();
                if (responses[word]) {
                    delete responses[word];
                    db.set(ctx.remoteJid, responses);
                    await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Responder', `✅ Réponse supprimée pour : *${word}*`) });
                } else {
                    await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Mot non trouvé.' });
                }
                break;
            default:
                const usage = [
                    '▸ .responder add <mot> <réponse>',
                    '▸ .responder list',
                    '▸ .responder del <mot>'
                ];
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Responder Help', usage) });
        }
    }
};
