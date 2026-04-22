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
export function translate(key: string, locale: string = 'fr'): string {
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
    isOwner(sender: string, ownerNumber: string): boolean {
        const cleanSender = sender.split('@')[0];
        const cleanOwner = ownerNumber.replace(/[^0-9]/g, '');
        return cleanSender === cleanOwner;
    },

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
    async download(msg: proto.IWebMessageInfo, sock: WASocket): Promise<Buffer | null> {
        const type = Object.keys(msg.message || {}).find(k => k.endsWith('Message'));
        if (!type) return null;
        try {
            const messageContent = (msg.message as any)[type];
            const stream = await downloadContentFromMessage(messageContent, type.replace('Message', '') as any);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            return buffer;
        } catch (e) {
            return null;
        }
    },

    async getUrlFromMedia(buffer: Buffer, type: string): Promise<string | null> {
        const FormData = (await import('form-data')).default;
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buffer, { filename: `media.${type}` });
        try {
            const res = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders() });
            return res.data?.trim() || null;
        } catch {
            return null;
        }
    }
};

/**
 * Managers System (Optimisés)
 */
export class JSONDatabase<T = any> {
    private data: Record<string, T> = {};
    private filePath: string;
    constructor(fileName: string) {
        const dbDir = path.join(process.cwd(), 'database');
        if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
        this.filePath = path.join(dbDir, fileName);
        this.load();
    }
    private load() {
        if (fs.existsSync(this.filePath)) {
            try { this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf8')); } catch { this.data = {}; }
        }
    }
    public save() { fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2)); }
    public get(key: string): T | undefined { return this.data[key]; }
    public set(key: string, value: T) { this.data[key] = value; this.save(); }
    public delete(key: string) { delete this.data[key]; this.save(); }
}

export const botStatus = {
    isPublic(): boolean {
        const db = new JSONDatabase('config.json');
        return db.get('isPublic') !== false; // Public par défaut
    },
    setPublic(status: boolean) {
        const db = new JSONDatabase('config.json');
        db.set('isPublic', status);
    }
};

export class GroupMemberManager {
    constructor(botId: string) {}
}

export class CommandPermissionManager {
    constructor(private owner: string, botId: string) {}
}

export class AntiSpamManager {
    private db = new JSONDatabase('antispam_scores.json');
    async check(jid: string, sender: string): Promise<boolean> { return false; }
}

export const createManagers = (botId: string, owner: string) => ({
    members: new GroupMemberManager(botId),
    permissions: new CommandPermissionManager(owner, botId),
    antispam: new AntiSpamManager()
});
