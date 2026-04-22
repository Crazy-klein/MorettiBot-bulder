import { CommandContext } from '../../types/index.js';
import { formatMessage, mediaUtils } from '../../lib/utils.js';
import fs from 'fs';
import path from 'path';

export default {
    name: 'store',
    aliases: ['save', 'enregistrer'],
    description: 'Enregistre un média pour un usage futur',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        const name = ctx.args[0];
        if (!name) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .store <nom du fichier>' });

        const isMedia = ctx.mediaType || Object.keys(ctx.quotedMessage || {}).some(k => k.endsWith('Message'));
        if (!isMedia) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Citez ou envoyez un média.' });

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '💾', key: ctx.msg.key } });
            const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
            if (!buffer) throw new Error();

            const storageDir = path.join(process.cwd(), 'database', 'media_store');
            if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

            fs.writeFileSync(path.join(storageDir, `${name}.bin`), buffer);
            
            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Store', `✅ Média "${name}" sauvegardé !`) });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de sauvegarde.' });
        }
    }
};
