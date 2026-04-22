import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
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
            '╭── *🛡️ SÉCURITÉ* ──',
            '│ .antidelete, .antispam, .antitag',
            '│ .antilink, .antword, .antisticker',
            '│ .antivideo, .antistatus, .antiforward',
            '╰───────────────',
            '',
            '╭── *👥 GROUPE* ──',
            '│ .kick, .tagall, .mute, .unmute',
            '│ .promote, .demote, .welcome, .goodbye',
            '╰───────────────',
            '',
            '╭── *📥 DOWNLOADER* ──',
            '│ .tiktok, .facebook, .youtube, .play',
            '╰───────────────',
            '',
            '╭── *🤖 AUTOMATION* ──',
            '│ .autoreact, .autotype, .autovu',
            '│ .responder',
            '╰───────────────',
            '',
            '╭── *🧠 INTELLIGENCE* ──',
            '│ .ai <votre question>',
            '╰───────────────',
            '',
            '╭── *🔧 OUTILS* ──',
            '│ .weather, .lyrics, .ping, .qr',
            '│ .tts, .translate, .tourl, .getid',
            '╰───────────────'
        ];

        const text = formatMessage('Kurona Arsenal', sections, 'KuronaBot Builder v2.0');

        await ctx.sock.sendMessage(ctx.remoteJid, { 
            text, 
            mentions: [ctx.sender] 
        });
    }
};
