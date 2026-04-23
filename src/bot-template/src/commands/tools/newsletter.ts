import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export const command = {
  name: 'newsletter',
  aliases: ['chaine', 'canal'],
  description: 'Analyse des métadonnées d\'une chaîne WhatsApp',
  category: 'Tools',
  async execute(ctx: CommandContext) {
    const jid = ctx.args[0];
    if (!jid || !jid.endsWith('@newsletter')) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.newsletter <jid_newsletter>') });

    try {
      const metadata = await ctx.sock.newsletterMetadata('jid', jid);
      const info = [
        `📌 Titre : ${metadata.name}`,
        `🆔 ID : ${metadata.id}`,
        `👥 Abonnés : ${metadata.subscribers}`,
        `📝 Description : ${metadata.description || 'Aucune'}`,
        `📅 Statut : ${metadata.state}`
      ];
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Infos Chaîne', info) });
    } catch {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Impossible de récupérer les métadonnées.') });
    }
  }
};
