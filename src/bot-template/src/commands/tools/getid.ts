import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export const command = {
  name: 'getid',
  aliases: ['jid', 'id'],
  description: 'Affiche votre ID WhatsApp ou celui du groupe',
  category: 'Tools',
  async execute(ctx: CommandContext) {
    const target = ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || ctx.quotedMessage?.participant || ctx.remoteJid;
    await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Identifiants', `🆔 ID : ${target}`) });
  }
};
