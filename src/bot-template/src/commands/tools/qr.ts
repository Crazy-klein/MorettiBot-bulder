import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import QRCode from 'qrcode';

export const command = {
  name: 'qr',
  aliases: ['qrcode'],
  description: 'Générateur de QR code',
  category: 'Tools',
  async execute(ctx: CommandContext) {
    const text = ctx.args.join(' ');
    if (!text) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.qr <texte>') });

    try {
      const qrBuffer = await QRCode.toBuffer(text);
      await ctx.sock.sendMessage(ctx.remoteJid, { image: qrBuffer, caption: formatMessage('QR Code', `✅ QR Code généré pour : ${text.slice(0, 30)}...`) });
    } catch {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Échec de génération du QR Code.') });
    }
  }
};
