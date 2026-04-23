import { CommandContext } from '../../types/index.js';
import { permissions, JSONDatabase } from '../../lib/utils.js';
import { config } from '../../config.js';
import { formatMessage } from '../../lib/messageStyler.js';

const db = new JSONDatabase<string[]>('sudo.json');

export const command = {
  name: 'sudo',
  aliases: ['addsudo'],
  description: 'Ajoute un utilisateur à la liste sudo',
  category: 'Owner',
  async execute(ctx: CommandContext) {
    if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;

    const target = ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || ctx.quotedMessage?.participant;
    if (!target) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', 'Taguez l\'utilisateur.') });

    const sudos = db.get('users') || [];
    if (!sudos.includes(target)) {
      sudos.push(target);
      db.set('users', sudos);
    }
    await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Sudo', `✅ @${target.split('@')[0]} est désormais SUDO.`), mentions: [target] });
  }
};
