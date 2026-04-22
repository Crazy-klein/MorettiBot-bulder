import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import axios from 'axios';

export default {
    name: 'weather',
    aliases: ['meteo', 'temp'],
    description: 'Affiche la météo d\'une ville',
    category: 'Search',
    async execute(ctx: CommandContext) {
        const city = ctx.args.join(' ');
        if (!city) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🏙️ Quelle ville ?' });

        try {
            const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=8929465f2122849ad3721387d81a95fe&units=metric&lang=fr`);
            const data = res.data;
            
            const info = [
                `📍 Ville : ${data.name}, ${data.sys.country}`,
                `🌡️ Température : ${data.main.temp}°C`,
                `✨ Ressenti : ${data.main.feels_like}°C`,
                `💧 Humidité : ${data.main.humidity}%`,
                `🌬️ Vent : ${data.wind.speed} km/h`,
                `☁️ Ciel : ${data.weather[0].description}`
            ];

            await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Météo', info) });
        } catch {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: '❌ Ville non trouvée ou erreur API.' });
        }
    }
};
