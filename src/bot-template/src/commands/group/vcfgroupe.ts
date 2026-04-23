import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export const command = {
  name: 'vcfgroupe',
  aliases: ['exportvcf', 'contacts'],
  description: 'Génère un fichier VCF des membres',
  category: 'Group',
  async execute(ctx: CommandContext) {
    if (!ctx.isGroup) return;

    try {
      const metadata = await ctx.sock.groupMetadata(ctx.remoteJid);
      const participants = metadata.participants;
      
      let vcf = '';
      participants.forEach((p, i) => {
        const id = p.id.split('@')[0];
        vcf += `BEGIN:VCARD\nVERSION:3.0\nFN:Member ${i+1} (${id})\nTEL;TYPE=CELL:${id}\nEND:VCARD\n`;
      });

      const buffer = Buffer.from(vcf);
      await ctx.sock.sendMessage(ctx.remoteJid, { 
        document: buffer, 
        fileName: `contacts_${metadata.subject}.vcf`,
        mimetype: 'text/vcard',
        caption: formatMessage('Export VCF', `✅ ${participants.length} contacts exportés.`)
      });
    } catch (e: any) {
      await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', e.message) });
    }
  }
};
