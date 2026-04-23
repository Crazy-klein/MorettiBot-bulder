import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';

export const command = {
  name: 'tagall',
  aliases: ['tous', 'appel'],
  description: 'Mentionner tous les membres du groupe',
  category: 'Group',
  async execute(ctx: CommandContext) {
    if (!ctx.isGroup) return;
    if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

    try {
      const metadata = await ctx.sock.groupMetadata(ctx.remoteJid);
      const participants = metadata.participants.map(p => p.id);
      const message = ctx.args.join(' ') || 'Appel général !';
      
      let tagMsg = `📣 *ANNOUNCE GÉNÉRALE*\n\n`;
      tagMsg += `📝 Message : ${message}\n\n`;
      participants.forEach(id => tagMsg += `┣ ❍ @${id.split('@')[0]}\n`);
      tagMsg += `┗━━━━━━━━━━━━━`;

      await ctx.sock.sendMessage(ctx.remoteJid, { text: tagMsg, mentions: participants });
    } catch (e: any) {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', e.message) });
    }
  }
};
