import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';

export default {
    name: 'sendaudio',
    aliases: ['sa', 'aud'],
    description: 'Envoie un fichier audio local ou enregistré',
    category: 'Tools',
    async execute(ctx: CommandContext) {
        const audioName = ctx.args[0];
        if (!audioName) return await ctx.sock.sendMessage(ctx.remoteJid, { text: '🎵 Nom de l\'audio requis.' });

        const isPtt = ctx.fullArgs.includes('--ptt');
        const isViewOnce = ctx.fullArgs.includes('--viewonce');

        await ctx.sock.sendMessage(ctx.remoteJid, { 
            text: formatMessage('Audio Sender', [
                `📤 Envoi de : ${audioName}`,
                `🎙️ Mode PTT : ${isPtt ? 'Oui' : 'Non'}`,
                `👁️ Éphémère : ${isViewOnce ? 'Oui' : 'Non'}`
            ]) 
        });
    }
};
