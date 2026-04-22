import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import fs from 'fs';
import path from 'path';

export default {
    name: 'getmedia',
    aliases: ['si', 'sendimg', 'sendvid', 'sendaudio', 'getfile'],
    description: 'Récupère un média du stockage interne',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        const name = ctx.args[0];
        if (!name) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .getmedia <nom>' });

        const storageDir = path.join(process.cwd(), 'database', 'media_store');
        const filePath = path.join(storageDir, `${name}.bin`);

        if (!fs.existsSync(filePath)) return await ctx.sock.sendMessage(ctx.remoteJid, { text: `❌ Fichier "${name}" introuvable.` });

        try {
            const buffer = fs.readFileSync(filePath);
            
            // On tente de deviner le type par l'alias ou par sniff (ici par alias pour simplifier le template)
            const cmd = ctx.msg.message?.conversation?.split(' ')[0].slice(1) || '';
            
            if (cmd === 'sendimg' || cmd === 'si') {
                await ctx.sock.sendMessage(ctx.remoteJid, { image: buffer, caption: name });
            } else if (cmd === 'sendvid') {
                await ctx.sock.sendMessage(ctx.remoteJid, { video: buffer, caption: name });
            } else if (cmd === 'sendaudio') {
                await ctx.sock.sendMessage(ctx.remoteJid, { audio: buffer, mimetype: 'audio/mpeg' });
            } else {
                // Auto-détection basique ou Document par défaut
                await ctx.sock.sendMessage(ctx.remoteJid, { document: buffer, fileName: `${name}.bin`, mimetype: 'application/octet-stream' });
            }

        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de lecture.' });
        }
    }
};
