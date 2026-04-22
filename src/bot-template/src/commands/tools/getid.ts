import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';

export default {
    name: 'getid',
    aliases: ['jid', 'lid'],
    description: 'Affiche les identifiants techniques JID/LID',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        const target = ctx.mentionedJid[0] || (ctx.quotedMessage ? (ctx.msg.message as any)?.extendedTextMessage?.contextInfo?.participant : ctx.sender);
        
        const info = [
            `👥 Cible : @${target.split('@')[0]}`,
            `🆔 JID : \`${target}\``,
            `🖇️ Type : ${target.includes(':') ? 'LID' : 'Standard'}`
        ];

        await ctx.sock.sendMessage(ctx.remoteJid, { 
            text: formatMessage('Identity Info', info),
            mentions: [target]
        });
    }
};
