import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export const command = {
  name: 'groupinfo',
  aliases: ['infogroupe', 'gcinfo'],
  description: 'Affiche les informations du groupe',
  category: 'Group',
  async execute(ctx: CommandContext) {
    if (!ctx.isGroup) return;
    
    try {
      const metadata = await ctx.sock.groupMetadata(ctx.remoteJid);
      const admins = metadata.participants.filter(p => p.admin !== null).length;
      const creationDate = new Date(metadata.creation! * 1000).toLocaleString('fr-FR');
      
      const info = [
        `📌 Nom : ${metadata.subject}`,
        `🆔 ID : ${metadata.id}`,
        `👑 Créateur : ${metadata.owner || 'Inconnu'}`,
        `📅 Créé le : ${creationDate}`,
        `👥 Membres : ${metadata.participants.length}`,
        `👮 Admins : ${admins}`,
        `🔒 Restreint : ${metadata.announce ? 'Oui (Admins seulement)' : 'Non'}`
      ];

      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Infos Groupe', info) });
    } catch (e: any) {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', e.message) });
    }
  }
};
