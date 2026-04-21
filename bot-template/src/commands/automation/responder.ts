import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export default {
    name: 'responder',
    aliases: ['mr', 'auto-reply'],
    description: 'Gère les réponses automatiques personnalisées',
    category: 'Automation',
    async execute(ctx: CommandContext) {
        const sub = ctx.args[0]?.toLowerCase();
        
        switch(sub) {
            case 'add':
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Responder', '✅ Réponse automatique ajoutée.') });
                break;
            case 'list':
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Responder List', 'Aucune réponse configurée.') });
                break;
            default:
                const usage = [
                    '▸ .responder add <mot> (citer un message)',
                    '▸ .responder list',
                    '▸ .responder del <mot>'
                ];
                await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Responder Help', usage) });
        }
    }
};
