import { proto, WASocket, jidNormalizedUser } from '@whiskeysockets/baileys';
import { config } from '../config.js';
import { formatMessage, permissions, createManagers, logger, JSONDatabase } from '../lib/utils.js';
import path from 'path';
import fs from 'fs';

// Initialisation des managers
const managers = createManagers(config.ownerNumber, config.ownerNumber);

export const handleMessage = async (sock: WASocket, m: { messages: proto.IWebMessageInfo[], type: string }) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const remoteJid = msg.key.remoteJid!;
    const sender = msg.key.participant || msg.key.remoteJid!;
    const isGroup = remoteJid.endsWith('@g.us');
    
    // Extraction texte
    const body = msg.message.conversation || 
                 msg.message.extendedTextMessage?.text || 
                 msg.message.imageMessage?.caption || 
                 msg.message.videoMessage?.caption || "";
    
    // --- MODULES DE SÉCURITÉ ---
    if (isGroup) {
        // Anti-Link
        const linkDb = new JSONDatabase('antilink.json');
        if (linkDb.get(remoteJid) && body.match(/https?:\/\/[^\s]+/)) {
            const isAdmin = await permissions.isAdmin(sock, remoteJid, sender);
            if (!isAdmin) {
                await sock.sendMessage(remoteJid, { delete: msg.key });
                return; // On arrête le traitement
            }
        }

        // Anti-Tag (Mention Flood)
        const tagDb = new JSONDatabase('antitag.json');
        const mentionLimit = tagDb.get(remoteJid) as number || 5;
        const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentions.length >= mentionLimit) {
            const isAdmin = await permissions.isAdmin(sock, remoteJid, sender);
            if (!isAdmin) {
                await sock.sendMessage(remoteJid, { delete: msg.key });
                await sock.groupParticipantsUpdate(remoteJid, [sender], 'remove');
                return;
            }
        }

        // Anti-Spam (Rate Limiting)
        const spamDb = new JSONDatabase('antispam.json');
        if (spamDb.get(remoteJid)) {
            const now = Date.now();
            const userSpamKey = `${remoteJid}:${sender}`;
            const lastMsgTime = spamDb.get(userSpamKey) as number || 0;
            if (now - lastMsgTime < 1500) { // 1.5s interval
                await sock.sendMessage(remoteJid, { delete: msg.key });
                return;
            }
            spamDb.set(userSpamKey, now);
        }

        // Anti-Sticker
        const stkDb = new JSONDatabase('antisticker.json');
        if (stkDb.get(remoteJid) && msg.message.stickerMessage) {
            const isAdmin = await permissions.isAdmin(sock, remoteJid, sender);
            if (!isAdmin) return await sock.sendMessage(remoteJid, { delete: msg.key });
        }

        // Anti-Video
        const vidDb = new JSONDatabase('antivideo.json');
        if (vidDb.get(remoteJid) && msg.message.videoMessage) {
            const isAdmin = await permissions.isAdmin(sock, remoteJid, sender);
            if (!isAdmin) return await sock.sendMessage(remoteJid, { delete: msg.key });
        }

        // Anti-Transfert
        const transferDb = new JSONDatabase('antitransfer.json');
        if (transferDb.get(remoteJid) && (msg.message.extendedTextMessage?.contextInfo?.isForwarded || msg.message.imageMessage?.contextInfo?.isForwarded)) {
            const isAdmin = await permissions.isAdmin(sock, remoteJid, sender);
            if (!isAdmin) return await sock.sendMessage(remoteJid, { delete: msg.key });
        }
    }

    if (!body.startsWith(config.prefix)) return;

    const args = body.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    const fullArgs = args.join(' ');
    
    // Détection Média
    const mediaType = msg.message.imageMessage ? 'image' : 
                      msg.message.videoMessage ? 'video' : 
                      msg.message.audioMessage ? 'audio' : 
                      msg.message.stickerMessage ? 'sticker' : null;

    // Contexte de Commande
    const ctx = {
        sock,
        msg,
        remoteJid,
        sender,
        isGroup,
        args,
        fullArgs,
        text: fullArgs,
        mediaType,
        quotedMessage: msg.message.extendedTextMessage?.contextInfo?.quotedMessage,
        mentionedJid: msg.message.extendedTextMessage?.contextInfo?.mentionedJid || []
    };

    // Chargement dynamique des commandes (Dispatcher optimisé)
    try {
        const commandsDir = path.join(process.cwd(), 'src', 'commands');
        let commandFound = false;

        // On parcourt les sous-dossiers pour trouver la commande
        const categories = fs.readdirSync(commandsDir);
        for (const cat of categories) {
            const catPath = path.join(commandsDir, cat);
            if (!fs.statSync(catPath).isDirectory()) continue;

            const files = fs.readdirSync(catPath);
            for (const file of files) {
                if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;
                
                const cmdModule = (await import(path.join(catPath, file))).default;
                if (cmdModule.name === commandName || (cmdModule.aliases && cmdModule.aliases.includes(commandName))) {
                    await cmdModule.execute(ctx);
                    commandFound = true;
                    break;
                }
            }
            if (commandFound) break;
        }

        if (!commandFound) {
            // Commandes statiques ou fallback
            if (commandName === 'ping') {
                const start = Date.now();
                await sock.sendMessage(remoteJid, { text: formatMessage('Ping', `📡 Latence : ${Date.now() - start}ms`) });
            }
        }
    } catch (e) {
        logger.error(`Command error (${commandName}):`, e);
    }
};
