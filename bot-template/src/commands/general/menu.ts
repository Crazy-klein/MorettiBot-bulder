import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { config } from '../../config.js';

export default {
    name: 'menu',
    description: 'Afficher le menu principal',
    category: 'General',
    async execute(ctx: CommandContext) {
        const menuSections = [
            `Utilisateur: @${ctx.sender.split('@')[0]}`,
            `Prefix: ${config.prefix}`,
            '',
            '📜 *COMMANDES DISPONIBLES*',
            '• .ai <votre question>',
            '• .sticker (citer une image)',
            '• .menu',
            '',
            '💡 _Plus de commandes bientôt disponibles._'
        ];

        const response = formatMessage('Kurona Menu', menuSections, 'KuronaBot v1.0.0');
        
        await ctx.sock.sendMessage(ctx.remoteJid, { 
            text: response,
            mentions: [ctx.sender] 
        });
    }
};
