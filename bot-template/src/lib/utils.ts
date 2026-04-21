import { WASocket, downloadContentFromMessage, proto } from '@whiskeysockets/baileys';
import axios from 'axios';

/**
 * Fonctions de vérification des permissions
 */
export const permissions = {
    /**
     * Vérifie si l'expéditeur est le propriétaire configuré
     */
    isOwner(sender: string, ownerNumber: string): boolean {
        const cleanSender = sender.split('@')[0];
        const cleanOwner = ownerNumber.replace(/[^0-9]/g, '');
        return cleanSender === cleanOwner;
    },

    /**
     * Vérifie si l'expéditeur est administrateur du groupe
     */
    async isAdmin(sock: WASocket, remoteJid: string, sender: string): Promise<boolean> {
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
};

/**
 * Utilitaires pour la gestion des médias
 */
export const mediaUtils = {
    /**
     * Télécharge le contenu média d'un message (image, video, audio, sticker)
     */
    async download(msg: proto.IWebMessageInfo, sock: WASocket): Promise<Buffer | null> {
        const type = Object.keys(msg.message || {}).find(k => k.endsWith('Message'));
        if (!type) return null;
        
        try {
            const messageContent = (msg.message as any)[type];
            const stream = await downloadContentFromMessage(messageContent, type.replace('Message', '') as any);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            return buffer;
        } catch (e) {
            console.error('Erreur downloadMedia:', e);
            return null;
        }
    },

    /**
     * Tente d'extraire un lien média à partir de divers services
     */
    async getUrlFromMedia(buffer: Buffer, type: string): Promise<string | null> {
        // Utilisation de catbox.moe pour l'hébergement temporaire
        const FormData = (await import('form-data')).default;
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buffer, { filename: `media.${type}` });
        
        try {
            const res = await axios.post('https://catbox.moe/user/api.php', form, {
                headers: form.getHeaders(),
                timeout: 30000
            });
            return res.data?.trim() || null;
        } catch (e) {
            console.error('Erreur upload catbox:', e);
            return null;
        }
    }
};

/**
 * Utilitaires de recherche et de scraping
 */
export const scraping = {
    async getYoutubeId(query: string): Promise<string | null> {
        try {
            const res = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
            return res.data.match(/"videoId":"([^"]+)"/)?.[1] || null;
        } catch {
            return null;
        }
    },
    
    async googleSearch(query: string) {
        return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
};

/**
 * Formatage et utilitaires divers
 */
export const miscUtils = {
    sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
    
    runtime: (seconds: number) => {
        seconds = Number(seconds);
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor(seconds % (3600 * 24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 60);
        const dDisplay = d > 0 ? d + (d == 1 ? " jour, " : " jours, ") : "";
        const hDisplay = h > 0 ? h + (h == 1 ? " heure, " : " heures, ") : "";
        const mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
        const sDisplay = s > 0 ? s + (s == 1 ? " seconde" : " secondes") : "";
        return dDisplay + hDisplay + mDisplay + sDisplay;
    }
};
