import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { config } from '../../config.js';

export default {
    name: 'menu',
    aliases: ['help', 'aide', 'commandes'],
    description: 'Affiche l\'arsenal de commandes du bot',
    category: 'General',
    async execute(ctx: CommandContext) {
        const sections = [
            `Utilisateur: @${ctx.sender.split('@')[0]}`,
            `Prefixe: ${config.prefix}`,
            '',
            '╭── *🛡️ GROUPE* ──',
            '│ .kick, .add, .tagall, .mute, .unmute',
            '│ .promote, .demote, .antibot, .antilink',
            '╰───────────────',
            '',
            '╭── *🚀 CONVERSION* ──',
            '│ .sticker, .toimg, .tomp3',
            '╰───────────────',
            '',
            '╭── *📥 DOWNLOAD* ──',
            '│ .tiktok, .fb, .insta, .play',
            '╰───────────────',
            '',
            '╭── *🤔 INTELLIGENCE* ──',
            '│ .ai <votre question>',
            '╰───────────────',
            '',
            '╭── *🔧 OUTILS* ──',
            '│ .weather, .lyrics, .ping, .qr',
            '╰───────────────'
        ];

        const text = formatMessage('Kurona Arsenal', sections, 'KuronaBot Builder v1.0');

        await ctx.sock.sendMessage(ctx.remoteJid, { 
            text, 
            mentions: [ctx.sender] 
        });
    }
};
