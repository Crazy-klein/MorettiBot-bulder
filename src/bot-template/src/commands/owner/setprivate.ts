import { CommandContext } from '../../types/index.js';
import { botStatus, permissions } from '../../lib/utils.js';
import { config } from '../../config.js';
import { formatMessage } from '../../lib/messageStyler.js';

export const command = {
  name: 'setprivate',
  aliases: ['mode_prive'],
  description: 'Seul l\'owner peut utiliser le bot',
  category: 'Owner',
  async execute(ctx: CommandContext) {
    if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;
    botStatus.setPublic(false);
    await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Mode Système', '✅ Mode PRIVÉ activé. Seul le créateur peut m\'utiliser.') });
  }
};
