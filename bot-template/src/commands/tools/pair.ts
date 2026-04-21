import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import axios from 'axios';

export default {
    name: 'pair',
    aliases: ['pairing', 'code'],
    description: 'Génère un code de pairing pour un numéro.',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        const number = ctx.args[0]?.replace(/[^0-9]/g, '');
        if (!number || number.length < 10) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Exemple : .pair 225XXXXXXXX' });
        }

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '⏳ _Génération du code..._' });

            // Utilisation d'une API externe pour le code de pairing (basé sur le code fourni)
            const res = await axios.get(`https://knight-bot-paircode.onrender.com/code?number=${number}`);
            
            if (res.data?.code) {
                await ctx.sock.sendMessage(ctx.remoteJid, { 
                    text: formatMessage('Pairing Code', [
                        `Numéro : ${number}`,
                        `Code : *${res.data.code}*`,
                        '',
                        '_Utilisez ce code dans WhatsApp > Appareils connectés > Connecter un appareil > Se connecter avec le numéro de téléphone_'
                    ])
                });
            } else {
                throw new Error('Pas de code reçu');
            }

        } catch (e) {
            console.error(e);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Échec de génération. Réessayez plus tard.' });
        }
    }
};
