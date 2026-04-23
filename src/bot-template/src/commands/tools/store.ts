import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { mediaUtils, permissions } from '../../lib/utils.js';
import { config } from '../../config.js';
import fs from 'fs';
import path from 'path';

export const command = {
  name: 'store',
  aliases: ['savemedia', 'archiver'],
  description: 'Archivage local de média',
  category: 'Tools',
  async execute(ctx: CommandContext) {
    if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;

    const name = ctx.args[0];
    if (!name) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.store <nom_archive>') });

    const buffer = await mediaUtils.download(ctx.msg, ctx.sock);
    const quotedBuffer = ctx.quotedMessage ? await mediaUtils.download({ message: ctx.quotedMessage } as any, ctx.sock) : null;
    const finalBuffer = buffer || quotedBuffer;

    if (!finalBuffer) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Media introuvable (image, vidéo, audio).') });

    const dir = path.join(process.cwd(), 'database', 'internal_storage');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, name);
    fs.writeFileSync(filePath, finalBuffer);

    await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Succès', `✅ Média archivé sous le nom : ${name}`) });
  }
};
