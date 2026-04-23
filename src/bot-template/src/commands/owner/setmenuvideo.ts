import { CommandContext } from '../../types/index.js';
import { mediaUtils, permissions, JSONDatabase } from '../../lib/utils.js';
import { config } from '../../config.js';
import { formatMessage } from '../../lib/messageStyler.js';

const db = new JSONDatabase('config.json');

export const command = {
  name: 'setmenuvideo',
  aliases: ['menuvideo'],
  description: 'Définit la vidéo du menu',
  category: 'Owner',
  async execute(ctx: CommandContext) {
    if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;

    const url = ctx.args[0];
    if (!url) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.setmenuvideo <url_video>') });

    db.set('menuVideo', url);
    await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Succès', '✅ Vidéo du menu configurée.') });
  }
};
