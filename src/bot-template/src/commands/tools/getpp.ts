import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';

export default {
    name: 'getpp',
    aliases: ['pp'],
    description: 'Récupère la photo de profil',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        const target = ctx.mentionedJid[0] || (ctx.quotedMessage ? (ctx.msg.message as any)?.extendedTextMessage?.contextInfo?.participant : ctx.sender);

        try {
            const url = await ctx.sock.profilePictureUrl(target, 'image');
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                image: { url }, 
                caption: formatMessage('Profile Picture', `Photo de profil de @${target.split('@')[0]}`),
                mentions: [target]
            });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Photo de profil introuvable ou privée.' });
        }
    }
};
