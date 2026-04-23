import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions, JSONDatabase } from '../../lib/utils.js';

const db = new JSONDatabase('antidelete.json');

export const command = {
  name: 'antidelete',
  aliases: ['adc'],
  description: 'Active/Désactive l\'anti-suppression de messages',
  category: 'Security',
  async execute(ctx: CommandContext) {
    if (!ctx.isGroup) return;
    if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) {
      return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Cette commande est réservée aux administrateurs.') });
    }

    const action = ctx.args[0]?.toLowerCase();
    if (action === 'on') {
      db.set(ctx.remoteJid, true);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Sécurité', '🛡️ Anti-Delete activé avec succès.') });
    } else if (action === 'off') {
      db.delete(ctx.remoteJid);
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Sécurité', '🔓 Anti-Delete désactivé.') });
    } else {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.antidelete <on/off>') });
    }
  }
};
