import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';

export default {
    name: 'newsletter',
    aliases: ['cid', 'chinfo'],
    description: 'Récupère les détails d\'un canal WhatsApp',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        const url = ctx.args[0];
        if (!url || !url.includes("whatsapp.com/channel/")) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .newsletter <lien_canal>' });
        }

        try {
            const inviteCode = url.split('whatsapp.com/channel/')[1];
            // @ts-ignore - Baileys method
            const res = await ctx.sock.newsletterMetadata("invite", inviteCode);

            const details = [
                `🆔 ID : ${res.id}`,
                `🏷️ Nom : ${res.name}`,
                `👥 Followers : ${res.subscribers}`,
                `✅ Vérifié : ${res.verification === "VERIFIED" ? "Oui" : "Non"}`,
                `📊 Statut : ${res.state}`
            ];

            await ctx.sock.sendMessage(ctx.remoteJid, {
                text: formatMessage('Newsletter Meta', details)
            });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Échec de récupération. Le canal est peut-être privé ou le lien est mort.' });
        }
    }
};
