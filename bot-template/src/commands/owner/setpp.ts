import { CommandContext } from '../../types/index.js';
import { permissions } from '../../lib/utils.js';
import { config } from '../../config.js';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

export default {
    name: 'setpp',
    aliases: ['setavatar', 'setpfp'],
    description: 'Change la photo de profil du bot (Owner uniquement)',
    category: 'Owner',
    async execute(ctx: CommandContext) {
        if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;

        if (!ctx.quotedMessage?.imageMessage) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: '⚠️ Répondez à une image pour définir le profil.' });
        }

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '📥', key: ctx.msg.key } });

            const buffer = await downloadMediaMessage(ctx.msg, 'buffer', {});
            await ctx.sock.updateProfilePicture(ctx.sock.user?.id!, buffer as Buffer);

            await ctx.sock.sendMessage(ctx.remoteJid, { text: '✅ Photo de profil mise à jour !' });

        } catch (e) {
            console.error('SetPP Error:', e);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de mise à jour.' });
        }
    }
};
