import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import QRCode from 'qrcode';

export default {
    name: 'qr',
    aliases: ['qrcode'],
    description: 'Crée un QR Code pour un texte/lien',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        const text = ctx.args.join(' ');
        if (!text) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .qr <texte>' });

        try {
            const buffer = await QRCode.toBuffer(text, { width: 500, margin: 2 });
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                image: buffer,
                caption: formatMessage('Générateur QR', '✅ Voici votre ticket numérique (QR Code).')
            });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Échec génération.' });
        }
    }
};
