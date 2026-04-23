import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export const command = {
  name: 'getpp',
  aliases: ['pp'],
  description: 'Récupère la photo de profil en HD',
  category: 'Tools',
  async execute(ctx: CommandContext) {
    const target = ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || ctx.quotedMessage?.participant || ctx.remoteJid;
    
    try {
      const ppUrl = await ctx.sock.profilePictureUrl(target, 'image');
      await ctx.sock.sendMessage(ctx.remoteJid, { image: { url: ppUrl }, caption: formatMessage('Avatar HD', `📸 Photo deprofil de @${target.split('@')[0]}`), mentions: [target] });
    } catch {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Impossible de récupérer la photo de profil (Introuvable ou privée).') });
    }
  }
};
