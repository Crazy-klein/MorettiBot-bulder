import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions, scraping } from '../../lib/utils.js';
import fs from 'fs';
import path from 'path';

export default {
    name: 'vcfgroupe',
    aliases: ['vcf', 'contacts'],
    description: 'Génère un fichier VCF avec les contacts du groupe',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;

        const isUserAdmin = await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender);
        if (!isUserAdmin) return;

        try {
            const metadata = await ctx.sock.groupMetadata(ctx.remoteJid);
            const participants = metadata.participants;
            
            let vcfContent = '';
            participants.forEach((p, i) => {
                const name = p.id.split('@')[0];
                vcfContent += scraping.generateVCard(`GP_${metadata.subject.substring(0,10)}_${i+1}`, p.id) + '\n';
            });

            const fileName = `Contacts_${metadata.subject.replace(/\s/g, '_')}.vcf`;
            const filePath = path.join(process.cwd(), fileName);
            fs.writeFileSync(filePath, vcfContent);

            await ctx.sock.sendMessage(ctx.remoteJid, {
                document: { url: filePath },
                mimetype: 'text/vcard',
                fileName: fileName,
                caption: formatMessage('VCF Export', `Voici les contacts de ${metadata.subject} (${participants.length}).`)
            });

            fs.unlinkSync(filePath);
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur VCF.' });
        }
    }
};
