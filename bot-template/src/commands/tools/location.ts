import { CommandContext } from '../../types/index.js';
import { formatMessage, geocode } from '../../lib/utils.js';

export default {
    name: 'location',
    aliases: ['loc', 'geo', 'map'],
    description: 'Recherche un lieu et envoie sa localisation',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        const query = ctx.args.join(' ');
        if (!query) return await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Quelle adresse recherchez-vous ?' });

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { react: { text: '📍', key: ctx.msg.key } });

            const place = await geocode(query);
            
            if (place) {
                await ctx.sock.sendMessage(ctx.remoteJid, {
                    location: {
                        degreesLatitude: place.latitude,
                        degreesLongitude: place.longitude
                    }
                });
                await ctx.sock.sendMessage(ctx.remoteJid, { 
                    text: formatMessage('Localisation', `📍 Coordonnées envoyées pour votre recherche.`) 
                });
            } else {
                throw new Error('Lieu non trouvé');
            }

        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Impossible de trouver ce lieu.' });
        }
    }
};
