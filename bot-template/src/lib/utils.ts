import { WASocket, downloadContentFromMessage, proto } from '@whiskeysockets/baileys';
import { axios } from './axios.js'; // Assurez-vous d'avoir un wrapper axios ou utilisez global

/**
 * Vérifie si l'expéditeur est le propriétaire
 */
export function isOwner(sender: string, ownerNumber: string): boolean {
    const cleanSender = sender.split('@')[0];
    const cleanOwner = ownerNumber.replace(/[^0-9]/g, '');
    return cleanSender === cleanOwner;
}

/**
 * Vérifie si l'expéditeur est administrateur du groupe
 */
export async function isAdmin(sock: WASocket, remoteJid: string, sender: string): Promise<boolean> {
    if (!remoteJid.endsWith('@g.us')) return false;
    try {
        const groupMetadata = await sock.groupMetadata(remoteJid);
        return groupMetadata.participants
            .filter(p => p.admin !== null)
            .map(p => p.id)
            .includes(sender);
    } catch (e) {
        return false;
    }
}

/**
 * Télécharge un média (image, video, sticker, audio)
 */
export async function downloadMedia(msg: proto.IWebMessageInfo, sock: WASocket): Promise<Buffer | null> {
    const type = Object.keys(msg.message || {})[0];
    const messageContent = msg.message?.[type as keyof proto.IMessage];
    
    if (!messageContent || typeof messageContent !== 'object') return null;

    try {
        const stream = await downloadContentFromMessage(messageContent as any, type.replace('Message', '') as any);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    } catch (e) {
        console.error('Erreur downloadMedia:', e);
        return null;
    }
}

/**
 * Utilitaires de recherche
 */
export const searchTools = {
    async google(query: string) {
        // Logique de scraping google simplifiée
        return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    },
    async youtube(query: string) {
        const res = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
        const match = res.data.match(/"videoId":"([^"]+)"/);
        return match ? match[1] : null;
    }
};

/**
 * Vérifie si un message contient un média
 */
export function hasMedia(message: any, type: string): boolean {
    const msg = message.imageMessage || message.videoMessage || message.audioMessage || message.stickerMessage || message.documentMessage;
    if (!msg) return false;
    
    switch(type) {
        case 'image': return !!message.imageMessage;
        case 'video': return !!message.videoMessage;
        case 'audio': return !!message.audioMessage;
        case 'sticker': return !!message.stickerMessage;
        case 'document': return !!message.documentMessage;
        default: return false;
    }
}
