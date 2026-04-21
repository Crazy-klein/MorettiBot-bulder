import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import QRCode from 'qrcode';

export default {
    name: 'qr',
    aliases: ['qrcode'],
    description: 'Génère un code QR pour un texte ou un lien',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        const text = ctx.args.join(' ');
        if (!text) return;

        try {
            const buffer = await QRCode.toBuffer(text, { width: 500 });
            await ctx.sock.sendMessage(ctx.remoteJid, { 
                image: buffer,
                caption: formatMessage('Générateur QR', 'Voici votre code QR !')
            });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur génération QR.' });
        }
    }
};
