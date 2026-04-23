import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { geocode } from '../../lib/utils.js';

export const command = {
  name: 'location',
  aliases: ['loc', 'gps'],
  description: 'Recherche une position GPS',
  category: 'Tools',
  async execute(ctx: CommandContext) {
    const address = ctx.args.join(' ');
    if (!address) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Usage', '.location <adresse/ville>') });

    const coords = await geocode(address);
    if (!coords) return await ctx.sock.sendMessage(ctx.remoteJid, { text: formatMessage('Erreur', 'Lieu introuvable.') });

    await ctx.sock.sendMessage(ctx.remoteJid, { 
      location: { 
        degreesLatitude: coords.latitude, 
        degreesLongitude: coords.longitude,
        name: address
      }
    });
  }
};
