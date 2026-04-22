import { WASocket, WAMessage, proto } from '@whiskeysockets/baileys';
import { config } from '../config.js';
import { CommandContext } from '../types/index.js';
import { logger, createManagers, formatMessage } from '../lib/utils.ts'; // Import centralisé et formatMessage fusionné

export class MessageHandler {
    private commands: Map<string, any> = new Map();
    private managers: any;

    constructor() {
        // Initialisation des managers fusionnés dans utils.ts
        this.managers = createManagers('bot-default', config.ownerNumber);
    }

    public registerCommand(name: string, command: any) {
        this.commands.set(name.toLowerCase(), command);
        if (command.aliases) {
            command.aliases.forEach((alias: string) => {
                this.commands.set(alias.toLowerCase(), command);
            });
        }
    }

    public async handle(sock: WASocket, msg: WAMessage) {
        if (!msg.message || msg.key.fromMe) return;

        const remoteJid = msg.key.remoteJid!;
        const sender = msg.key.participant || remoteJid;
        const isGroup = remoteJid.endsWith('@g.us');

        // Extraction du texte
        const messageContent = msg.message;
        const text = (messageContent.conversation || 
                     messageContent.extendedTextMessage?.text || 
                     messageContent.imageMessage?.caption || 
                     messageContent.videoMessage?.caption || '').trim();

        if (!text.startsWith(config.prefix)) {
            // Logique de capture d'activité (Ranking/AntiSpam) même si hors commande
            if (isGroup && this.managers.rankingManager.isEnabledForGroup(remoteJid)) {
                this.managers.rankingManager.recordActivity(remoteJid, sender);
            }
            return;
        }

        const args = text.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();

        if (!commandName) return;

        const command = this.commands.get(commandName);
        if (!command) {
            await sock.sendMessage(remoteJid, { react: { text: '❓', key: msg.key } });
            return;
        }

        // Vérification des permissions via le manager
        const permCheck = this.managers.permissionManager.checkCommandPermission({ sender, remoteJid, isGroup }, commandName);
        if (!permCheck.statut) {
            await sock.sendMessage(remoteJid, { react: { text: '🚫', key: msg.key } });
            return await sock.sendMessage(remoteJid, { text: formatMessage('Accès Refusé', 'Vous n\'avez pas la permission d\'utiliser cette commande.') });
        }

        // Calcul du texte complet après la commande
        const fullArgs = text.slice(config.prefix.length + commandName.length).trim();

        // Construction du contexte
        const ctx: CommandContext = {
            sock,
            msg,
            sender,
            remoteJid,
            text,
            args,
            fullArgs,
            isGroup,
            quotedMessage: messageContent.extendedTextMessage?.contextInfo?.quotedMessage || null,
            mentionedJid: messageContent.extendedTextMessage?.contextInfo?.mentionedJid || [],
            mediaType: this.detectMediaType(messageContent)
        };

        try {
            logger.info({ command: commandName, sender }, 'Exécution commande');
            await command.execute(ctx);
        } catch (error) {
            logger.error({ error, command: commandName }, 'Erreur exécution');
            await sock.sendMessage(remoteJid, { 
                text: formatMessage('Erreur Système', `Échec : ${error instanceof Error ? error.message : 'Inconnue'}`) 
            });
        }
    }

    private detectMediaType(message: proto.IMessage): any {
        if (message.imageMessage) return 'image';
        if (message.videoMessage) return 'video';
        if (message.audioMessage) return 'audio';
        if (message.stickerMessage) return 'sticker';
        if (message.documentMessage) return 'document';
        
        const quoted = message.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quoted) {
            if (quoted.imageMessage) return 'image';
            if (quoted.videoMessage) return 'video';
            if (quoted.audioMessage) return 'audio';
            if (quoted.stickerMessage) return 'sticker';
            if (quoted.documentMessage) return 'document';
        }
        
        return null;
    }
}
