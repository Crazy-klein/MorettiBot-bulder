import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions } from '../../lib/utils.js';
import { config } from '../../config.js';
import fs from 'fs';
import path from 'path';

export const command = {
  name: 'getmedia',
  aliases: ['recuperer', 'gm'],
  description: 'Récupère un média archivé localement',
  category: 'Tools',
  async execute(ctx: CommandContext) {
    if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;

    const name = ctx.args[0];
    if (!name) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.getmedia <nom_archive>') });

    const dir = path.join(process.cwd(), 'database', 'internal_storage');
    const filePath = path.join(dir, name);

    if (!fs.existsSync(filePath)) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Média introuvable.') });

    const buffer = fs.readFileSync(filePath);
    // On essaie de deviner le type (basique)
    await ctx.sock.sendMessage(ctx.remoteJid, { document: buffer, fileName: name, mimetype: 'application/octet-stream' });
  }
};
