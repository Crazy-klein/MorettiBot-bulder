import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export default {
    name: 'newsletter',
    aliases: ['cid', 'channelinfo'],
    description: 'Récupère les informations d\'un channel WhatsApp.',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        const text = ctx.args[0];
        if (!text) return await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Exemple : .newsletter <lien channel>' });
        if (!text.includes("https://whatsapp.com/channel/")) return await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Lien non valide.' });

        try {
            const inviteCode = text.split('https://whatsapp.com/channel/')[1];
            const res = await (ctx.sock as any).newsletterMetadata("invite", inviteCode);

            const info = [
                `🆔 ID : ${res.id}`,
                `🏷️ Nom : ${res.name}`,
                `👥 Followers : ${res.subscribers}`,
                `📊 Statut : ${res.state}`,
                `✅ Vérifié : ${res.verification === "VERIFIED" ? "Oui" : "Non"}`
            ];

            await ctx.sock.sendMessage(ctx.remoteJid, {
                text: formatMessage('Channel Info', info)
            });

        } catch (e) {
            console.error(e);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de récupération.' });
        }
    }
};
