import { CommandContext } from '../../types/index.js';
import { permissions } from '../../lib/utils.js';
import { config } from '../../config.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export const command = {
  name: 'gitclone',
  aliases: ['clone', 'install'],
  description: 'Cloner un dépôt GitHub de plugin',
  category: 'Owner',
  async execute(ctx: CommandContext) {
    if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;

    const url = ctx.args[0];
    if (!url) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.gitclone <url_repo>') });

    try {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Système', '📥 Clonage en cours...') });
      const { stdout } = await execPromise(`cd src/commands && git clone ${url}`);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Succès', '✅ Dépôt cloné avec succès.\n' + stdout) });
    } catch (e: any) {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', e.message) });
    }
  }
};
