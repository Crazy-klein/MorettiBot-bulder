import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import axios from 'axios';

export default {
    name: 'pair',
    aliases: ['code', 'pairing'],
    description: 'Obtient un code de couplage WhatsApp',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        const number = ctx.args[0]?.replace(/[^0-9]/g, '');
        if (!number || number.length < 10) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: '💡 Usage: .pair 225XXXXXXXX' });
        }

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '🔑', key: ctx.msg.key } });
            
            const res = await axios.get(`https://knight-bot-paircode.onrender.com/code?number=${number}`);
            
            if (res.data?.code) {
                await ctx.sock.sendMessage(ctx.remoteJid, { 
                    text: formatMessage('Pairing System', [
                        `📲 Numéro : ${number}`,
                        `🔑 Code : *${res.data.code}*`,
                        '',
                        '⚠️ _Saisissez ce code sur votre téléphone via "Appareils connectés" > "Se connecter avec le numéro"._'
                    ])
                });
            } else {
                throw new Error();
            }
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur de serveur de couplage. Réessayez plus tard.' });
        }
    }
};
