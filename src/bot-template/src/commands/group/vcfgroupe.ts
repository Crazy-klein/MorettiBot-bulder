import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, scraping } from '../../lib/utils.js';
import fs from 'fs';
import path from 'path';

export default {
    name: 'vcfgroupe',
    aliases: ['vcf', 'contacts'],
    description: 'Archive les contacts du groupe au format VCF',
    category: 'Group',
    async execute(ctx: CommandContext) {
        if (!ctx.isGroup) return;

        if (!await permissions.isAdmin(ctx.sock, ctx.remoteJid, ctx.sender)) return;

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '📇', key: ctx.msg.key } });
            
            const metadata = await ctx.sock.groupMetadata(ctx.remoteJid);
            const participants = metadata.participants;
            
            let vcfContent = '';
            participants.forEach((p, i) => {
                vcfContent += scraping.generateVCard(`GP_${metadata.subject.slice(0, 15)}_${i+1}`, p.id) + '\n';
            });

            const fileName = `Contacts_${metadata.subject.replace(/[^a-zA-Z0-9]/g, '_')}.vcf`;
            const storageDir = path.join(process.cwd(), 'database', 'internal_storage');
            if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
            
            const filePath = path.join(storageDir, fileName);
            fs.writeFileSync(filePath, vcfContent);

            await ctx.sock.sendMessage(ctx.remoteJid, {
                document: { url: filePath },
                mimetype: 'text/vcard',
                fileName: fileName,
                caption: formatMessage('VCF Export', `✅ ${participants.length} contacts synchronisés avec succès.`)
            });

            fs.unlinkSync(filePath);
        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur d\'exportation VCF.' });
        }
    }
};
