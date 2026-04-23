import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions, JSONDatabase } from '../../lib/utils.js';
import { config } from '../../config.js';

const db = new JSONDatabase('config.json');

export const command = {
  name: 'setprefix',
  aliases: ['pref'],
  description: 'Changer le préfixe du bot',
  category: 'Owner',
  async execute(ctx: CommandContext) {
    if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;

    const newPrefix = ctx.args[0];
    if (!newPrefix) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.setprefix <symbole>') });

    db.set('prefix', newPrefix);
    await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Succès', `✅ Préfixe mis à jour : ${newPrefix}\nRedémarrage recommandé.`) });
  }
};
