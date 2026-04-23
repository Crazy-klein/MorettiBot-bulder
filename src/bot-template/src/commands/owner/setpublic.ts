import { CommandContext } from '../../types/index.js';
import { botStatus, permissions } from '../../lib/utils.js';
import { config } from '../../config.js';
import { formatMessage } from '../../lib/messageStyler.js';

export const command = {
  name: 'setpublic',
  aliases: ['mode_public'],
  description: 'Mode libre pour tous',
  category: 'Owner',
  async execute(ctx: CommandContext) {
    if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;
    botStatus.setPublic(true);
    await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Mode Système', '✅ Mode PUBLIC activé. Tout le monde peut utiliser le bot.') });
  }
};
