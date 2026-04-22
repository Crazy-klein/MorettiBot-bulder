import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, mediaUtils } from '../../lib/utils.js';
import { config } from '../../config.js';

export default {
    name: 'setpp',
    aliases: ['setprofile'],
    description: 'Change la photo de profil du bot (Owner uniquement)',
    category: 'Owner',
    async execute(ctx: CommandContext) {
        if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;

        const isImage = ctx.mediaType === 'image' || Object.keys(ctx.quotedMessage || {}).includes('imageMessage');
        if (!isImage) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🖼️ Citez ou envoyez une image.' });

        try {
            const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
            if (!buffer) return;

            await ctx.sock.updateProfilePicture(ctx.sock.user?.id!, buffer);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Bot Settings', '✅ La photo de profil du bot a été mise à jour !') });
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de mise à jour.' });
        }
    }
};
