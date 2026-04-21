import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import axios from 'axios';

export default {
    name: 'location',
    aliases: ['loc', 'geo', 'map'],
    description: 'Recherche un lieu et envoie sa localisation',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        const query = ctx.args.join(' ');
        if (!query) return await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Quelle adresse recherchez-vous ?' });

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '⏳ _Recherche en cours..._' });

            // Utilisation d'une API OpenStreetMap pour la démo template
            const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
            
            if (res.data && res.data[0]) {
                const place = res.data[0];
                await ctx.sock.sendMessage(ctx.remoteJid, {
                    location: {
                        degreesLatitude: parseFloat(place.lat),
                        degreesLongitude: parseFloat(place.lon)
                    }
                });
                await ctx.sock.sendMessage(ctx.remoteJid, { 
                    text: formatMessage('Localisation', `📍 *Lieu :* ${place.display_name}`) 
                });
            } else {
                throw new Error('Lieu non trouvé');
            }

        } catch (e) {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Impossible de trouver ce lieu.' });
        }
    }
};
