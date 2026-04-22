import { CommandContext } from '../../types/index.js';
import { formatMessage, geocode } from '../../lib/utils.js';

export default {
    name: 'location',
    aliases: ['loc', 'map'],
    description: 'Envoie la localisation GPS d\'un lieu',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        const query = ctx.args.join(' ');
        if (!query) return await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Quelle adresse cherchez-vous ?' });

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
            } else {
                throw new Error();
            }
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Lieu introuvable.' });
        }
    }
};
