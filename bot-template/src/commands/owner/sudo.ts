import { CommandContext } from '../../types/index.js';
import { formatMessage, permissions, JSONDatabase } from '../../lib/utils.js';
import { config } from '../../config.js';

const db = new JSONDatabase<{ expires: number }>('sudo_users.json');

export default {
    name: 'sudo',
    description: 'Donne accès à des privilèges temporaires (Owner uniquement)',
    category: 'Owner',
    async execute(ctx: CommandContext) {
        if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;

        const target = ctx.mentionedJid[0] || (ctx.quotedMessage ? (ctx.msg.message as any)?.extendedTextMessage?.contextInfo?.participant : null);
        const duration = parseInt(ctx.args.filter(a => !a.includes('@'))[0]);

        if (!target || isNaN(duration)) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { 
                text: formatMessage('Sudo System', '💡 Usage: .sudo @user <minutes>') 
            });
        }

        const expires = Date.now() + (duration * 60 * 1000);
        db.set(target, { expires });

        await ctx.sock.sendMessage(ctx.remoteJid, { 
            text: formatMessage('Sudo', [
                `👤 Cible : @${target.split('@')[0]}`,
                `⏱️ Durée : ${duration} minutes`,
                '🛡️ État : Privilèges accordés'
            ]),
            mentions: [target]
        });
    }
};
