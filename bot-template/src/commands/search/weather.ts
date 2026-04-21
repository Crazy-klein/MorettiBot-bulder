import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import axios from 'axios';

export default {
    name: 'weather',
    aliases: ['meteo'],
    description: 'Affiche la météo pour une ville donnée',
    category: 'Search',
    async execute(ctx: CommandContext) {
        const city = ctx.args.join(' ');
        if (!city) return await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Ville requise !' });

        try {
            const res = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
            const current = res.data.current_condition[0];
            const area = res.data.nearest_area[0];

            const info = [
                `📍 Lieu: ${area.areaName[0].value}, ${area.country[0].value}`,
                `🌡️ Temp: ${current.temp_C}°C`,
                `☁️ État: ${current.weatherDesc[0].value}`,
                `💧 Humidité: ${current.humidity}%`,
                `💨 Vent: ${current.windspeedKmph} km/h`
            ];

            await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Météo Express', info) 
            });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Erreur lors de la récupération de la météo.' });
        }
    }
};
