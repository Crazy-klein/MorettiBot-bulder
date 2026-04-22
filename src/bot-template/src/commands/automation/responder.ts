import { CommandContext } from '../../types/index.js';
import { formatMessage, JSONDatabase, permissions } from '../../lib/utils.js';

const db = new JSONDatabase<Record<string, string>>('responder.json');

export default {
    name: 'responder',
    aliases: ['autoreply'],
    description: 'Crée des réponses automatiques basées sur des mots-clés',
    category: 'Automation',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;
        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        const action = ctx.args[0]?.toLowerCase();
        const key = ctx.args[1]?.toLowerCase();
        const response = ctx.args.slice(2).join(' ');

        const chatData = db.get(ctx.remoteJid) || {};

        if (action === 'add' && key && response) {
            chatData[key] = response;
            db.set(ctx.remoteJid, chatData);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Automation', `✅ Réponse ajoutée pour : "${key}"`) });
        } else if (action === 'del' && key) {
            delete chatData[key];
            db.set(ctx.remoteJid, chatData);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Automation', `🗑️ Réponse supprimée pour : "${key}"`) });
        } else if (action === 'list') {
            const keys = Object.keys(chatData);
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Auto-Responder', keys.length ? keys.map(k => `• ${k}`).join('\n') : 'Aucun mot-clé enregistré.') 
            });
        } else {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage:\n.responder add <mot> <réponse>\n.responder del <mot>\n.responder list' });
        }
    }
};
