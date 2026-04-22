import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/utils.js';
import { config } from '../../config.js';

export default {
    name: 'menu',
    aliases: ['help', 'aide'],
    description: 'Affiche la liste des commandes',
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
            '│ .antidemote, .antipromote, .antibot',
            '╰───────────────',
            '',
            '╭── *👥 GROUPE* ──',
            '│ .kick, .tagall, .mute, .unmute',
            '│ .promote, .demote, .welcome, .goodbye',
            '│ .kickall, .groupinfo, .setname, .setdesc',
            '│ .tagadmin, .approveall, .gcstatus, .vcf',
            '╰───────────────',
            '',
            '╭── *📥 DOWNLOADER* ──',
            '│ .tiktok, .facebook, .youtube, .play',
            '│ .playvid',
            '╰───────────────',
            '',
            '╭── *🤖 AUTOMATION* ──',
            '│ .autoreact, .autotype, .autovu',
            '│ .responder',
            '╰───────────────',
            '',
            '╭── *🔧 OUTILS* ──',
            '│ .weather, .lyrics, .ping, .qr, .getid',
            '│ .tts, .translate, .tourl, .getpp',
            '│ .location, .tg, .vv, .store, .getmedia',
            '╰───────────────',
            '',
            '╭── *🎨 CONVERTER* ──',
            '│ .sticker, .toimg, .takesticker',
            '╰───────────────'
        ];

        await ctx.sock.sendMessage(ctx.remoteJid, { 
            text: formatMessage('Kurona Arsenal', sections, 'KuronaBot Builder v2.0'),
            mentions: [ctx.sender] 
        });
    }
};
