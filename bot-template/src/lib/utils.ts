import { WASocket, downloadContentFromMessage, proto, jidNormalizedUser, downloadMediaMessage } from '@whiskeysockets/baileys';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import pino from 'pino';

const execPromise = promisify(exec);

/**
 * Logger système haute performance (Pino)
 */
export const logger = pino({
    level: 'info',
    transport: {
        targets: [
            {
                target: 'pino-pretty',
                options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' }
            }
        ]
    }
});

/**
 * Système de traduction (Internationalisation)
 */
const translationsCache: Record<string, any> = {};
export function translate(key: string, locale: string = 'fr'): string {
    // Simple mock pour le template (normalement charge depuis /languages/*.json)
    return `[${locale}] ${key}`;
}

/**
 * Utilitaire de retry asynchrone
 */
export async function retryAsync<T>(fn: () => Promise<T>, options: { retries: number, delayMs: number } = { retries: 3, delayMs: 1000 }): Promise<T> {
    let lastError: any;
    for (let i = 0; i < options.retries; i++) {
        try {
            return await fn();
        } catch (e) {
            lastError = e;
            await new Promise(r => setTimeout(r, options.delayMs));
        }
    }
    throw lastError;
}

/**
 * Géocodage (Recherche de coordonnées)
 */
export async function geocode(address: string) {
    try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`, {
            headers: { 'User-Agent': 'KuronaBot/1.0' }
        });
        if (res.data?.[0]) {
            return { latitude: parseFloat(res.data[0].lat), longitude: parseFloat(res.data[0].lon) };
        }
        return null;
    } catch {
        return null;
    }
}

import { config } from '../config.js';

/**
 * Fonctions de formatage de messages (ASCII Style)
 */
const defaultStyle = {
    topLeft: '╔', topRight: '╗', bottomLeft: '╚', bottomRight: '╝',
    horizontal: '┅', vertical: '┊', leftPrefix: '寂',
    titleSeparator: '❍   ❍', linePrefix: '┊┊'
};

export function formatMessage(title: string, content: string | string[], footer?: string): string {
    const lines = Array.isArray(content) ? content : [content];
    const topBorder = defaultStyle.horizontal.repeat(20);
    
    let message = `> ${defaultStyle.leftPrefix}${defaultStyle.topLeft}${topBorder}${defaultStyle.titleSeparator}${topBorder}${defaultStyle.topRight}\n`;
    message += `> ${defaultStyle.leftPrefix}${defaultStyle.vertical} ${title.toUpperCase()}\n`;
    message += `> ${defaultStyle.leftPrefix}${defaultStyle.bottomLeft}${defaultStyle.titleSeparator}${topBorder}${defaultStyle.bottomRight}\n`;
    message += `> ${defaultStyle.leftPrefix}${defaultStyle.topLeft}${topBorder}${defaultStyle.titleSeparator}${topBorder}${defaultStyle.topRight}\n`;
    
    lines.forEach(line => {
      message += `> ${defaultStyle.leftPrefix}${defaultStyle.linePrefix} ${line}\n`;
    });
    
    if (footer) message += `> ${defaultStyle.leftPrefix}${defaultStyle.linePrefix} ${footer}\n`;
    
    message += `> ${defaultStyle.leftPrefix}${defaultStyle.bottomLeft}${defaultStyle.titleSeparator}${topBorder}${defaultStyle.bottomRight}`;
    return message;
}

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
 * Gestionnaire des Membres et Identités (JID/LID)
 */
export class GroupMemberManager {
    constructor(private botId: string) {}
    async getLidFromPhoneNumber(sock: WASocket, groupJid: string, jid: string) { 
        return jid; // Logique réelle Baileys normalement
    }
    async getPhoneNumberFromLid(sock: WASocket, groupJid: string, lid: string) { 
        return lid; 
    }
}

/**
 * Gestionnaire des Permissions
 */
export enum CommandPermission { PUBLIC = 'PUBLIC', ADMIN = 'ADMIN', PREMIUM = 'PREMIUM', OWNER = 'OWNER', SUDO = 'SUDO' }
export class CommandPermissionManager {
    private sudoSessions = new Map<string, any>();
    constructor(private defaultOwner: string, private botId: string) {}
    
    checkCommandPermission(ctx: { sender: string, remoteJid: string, isGroup: boolean }, command: string) {
        if (ctx.sender.includes(this.defaultOwner)) return { statut: true, permission: CommandPermission.OWNER };
        // Logique simplifiée : tout le monde peut tout faire sauf si restreint
        return { statut: true, permission: CommandPermission.PUBLIC };
    }

    getSudoSession(jid: string) {
        return this.sudoSessions.get(jid);
    }
}

/**
 * Gestionnaire d'Automatisme (AutoReact, AutoVu, AutoWrite)
 */
export class AutomationManager {
    constructor(private botId: string) {}
    async handleAutoActions(sock: WASocket, msg: proto.IWebMessageInfo) {
        // Logique centralisée pour les réponses automatiques
    }
}

/**
 * Gestionnaire Multi-Sécurité (Spam, Links, Forbidden Words)
 */
export class SecurityManager {
    constructor(private botId: string) {}
    async checkViolation(sock: WASocket, msg: proto.IWebMessageInfo): Promise<boolean> {
        // Retourne true si une violation est détectée et traitée
        return false;
    }
}

/**
 * Moteur de recherche multimédia
 */
export const youtubeDownloader = {
    async search(query: string) {
        return [];
    },
    async download(url: string, type: 'mp3' | 'mp4') {
        return null;
    }
};

/**
 * Export des Managers Singleton-like
 */
export const createManagers = (botId: string, owner: string) => ({
    memberManager: new GroupMemberManager(botId),
    permissionManager: new CommandPermissionManager(owner, botId),
    automation: new AutomationManager(botId),
    security: new SecurityManager(botId),
    mediaDownloader: new MediaDownloader(botId),
    rankingManager: new RankingManager(botId),
    quiz: new GroupQuiz()
});

/**
 * Outils de recherche et de scraping
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
    },

    /**
     * Génère une VCard pour un utilisateur
     */
    generateVCard(name: string, jid: string): string {
        const phone = jid.split('@')[0];
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;TYPE=CELL:${phone}\nEND:VCARD`;
    }
};

/**
 * Handlers statiques pour la préparation des messages sortants
 */
export class MessageHandlers {
    static handleTextMessage(params: { text: string; mentions?: string[]; contextInfo?: any; quoted?: any }) {
        if (!params.text) throw new Error('Texte requis');
        const content = { text: params.text, mentions: params.mentions, contextInfo: params.contextInfo };
        const options = params.quoted ? { quoted: params.quoted } : undefined;
        return [content, options];
    }
    
    static handleImageMessage(params: { source: string | Buffer; caption?: string; viewOnce?: boolean; quoted?: any }) {
        const content = { image: typeof params.source === 'string' ? { url: params.source } : params.source, caption: params.caption, viewOnce: params.viewOnce };
        const options = params.quoted ? { quoted: params.quoted } : undefined;
        return [content, options];
    }

    static handleDeleteMessage(params: { key: proto.IMessageKey }) {
        return { delete: params.key };
    }

    static handleReactionMessage(params: { key: proto.IMessageKey; text: string }) {
        return { react: { text: params.text, key: params.key } };
    }
}

/**
 * Fonctions de manipulation d'images et stickers
 */
export const imageUtils = {
    async writeExif(media: { data: Buffer, mimetype: string }, metadata: { packname: string, author: string }) {
        const tempFile = path.join(process.cwd(), `sticker_${Date.now()}.webp`);
        fs.writeFileSync(tempFile, media.data);
        return tempFile;
    }
};

/**
 * Utilitaires pour la manipulation de texte et de messages
 */
export const textUtils = {
    /**
     * Extrait les IDs WhatsApp (JID) mentionnés dans un texte
     */
    extractMentions(text: string): string[] {
        return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
    },

    /**
     * Parse les arguments d'une commande pour extraire les flags (ex: --ptt, -f)
     */
    parseFlags(args: string[]): { flags: string[], cleanArgs: string[] } {
        const flags = args.filter(arg => arg.startsWith('--') || (arg.startsWith('-') && arg.length > 1));
        const cleanArgs = args.filter(arg => !arg.startsWith('-'));
        return { flags, cleanArgs };
    },

    /**
     * Nettoie un numéro de téléphone pour n'en garder que les chiffres
     */
    cleanNumber(num: string): string {
        return num.replace(/[^0-9]/g, '');
    }
};

/**
 * Utilitaires Système / Git
 */
export const systemUtils = {
    async gitClone(repoUrl: string): Promise<string | null> {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execPromise = promisify(exec);
        const path = await import('path');
        const fs = await import('fs');
        
        const tempDir = path.join(process.cwd(), 'temp_git_' + Date.now());
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        try {
            await execPromise(`git clone --depth 1 "${repoUrl}" "${tempDir}"`);
            return tempDir;
        } catch (e) {
            console.error('Git clone error:', e);
            return null;
        }
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
    },

    /**
     * Génère une couleur ARGB aléatoire pour les statuts
     */
    randomARGB(): number {
        const r = Math.floor(Math.random() * 200) + 55;
        const g = Math.floor(Math.random() * 200) + 55;
        const b = Math.floor(Math.random() * 200) + 55;
        return (0xFF << 24) | (r << 16) | (g << 8) | b;
    },

    /**
     * Vérifie si un JID est un groupe
     */
    isGroup(jid: string): boolean {
        return jid.endsWith('@g.us');
    },

    /**
     * Formate la taille d'un fichier
     */
    formatBytes(bytes: number, decimals: number = 2): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
};
