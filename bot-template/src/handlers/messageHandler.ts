import { WASocket, WAMessage, proto } from '@whiskeysockets/baileys';
import { config } from '../config.js';
import { CommandContext } from '../types/index.js';
import { formatMessage } from '../lib/messageStyler.js';

export class MessageHandler {
    private commands: Map<string, any> = new Map();

    constructor() {
        // Le chargement des commandes se fait dynamiquement dans l'applet principale
    }

    public registerCommand(name: string, command: any) {
        this.commands.set(name.toLowerCase(), command);
    }

    public async handle(sock: WASocket, msg: WAMessage) {
        if (!msg.message || msg.key.fromMe) return;

        const remoteJid = msg.key.remoteJid!;
        const sender = msg.key.participant || remoteJid;
        const isGroup = remoteJid.endsWith('@g.us');

        // Extraction du texte
        const messageContent = msg.message;
        const text = messageContent.conversation || 
                     messageContent.extendedTextMessage?.text || 
                     messageContent.imageMessage?.caption || 
                     messageContent.videoMessage?.caption || '';

        if (!text.startsWith(config.prefix)) return;

        const args = text.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();

        if (!commandName) return;

        const command = this.commands.get(commandName);
        if (!command) return;

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
            await command.execute(ctx);
        } catch (error) {
            console.error(`Erreur lors de l'exécution de ${commandName}:`, error);
            await sock.sendMessage(remoteJid, { 
                text: formatMessage('Erreur Système', `Une erreur est survenue lors de l'exécution de la commande : ${error instanceof Error ? error.message : 'Inconnue'}`) 
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
