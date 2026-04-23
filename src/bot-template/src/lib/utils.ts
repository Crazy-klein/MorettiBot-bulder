import { WASocket, downloadContentFromMessage, proto, jidNormalizedUser, downloadMediaMessage } from '@whiskeysockets/baileys';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import pino from 'pino';
import sharp from 'sharp';
import { CommandContext } from '../types/index.js';

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
    },

    async resizeThumbnail(imageBuffer: Buffer, maxWidth = 300, maxHeight = 200) {
        try {
            if (!imageBuffer) return null;
            return await sharp(imageBuffer)
                .resize({ width: maxWidth, height: maxHeight, fit: 'inside', withoutEnlargement: true })
                .toBuffer();
        } catch (err) {
            return imageBuffer;
        }
    },

    getRandomImage() {
        const ASSETS_PATH = path.resolve('assets', 'images');
        try {
            if (!fs.existsSync(ASSETS_PATH)) return null;
            const files = fs.readdirSync(ASSETS_PATH);
            const images = files.filter(file => file.endsWith('.png') && file.match(/^\d+\.png$/));
            if (images.length === 0) return null;
            const randomImage = images[Math.floor(Math.random() * images.length)];
            return fs.readFileSync(path.join(ASSETS_PATH, randomImage));
        } catch {
            return null;
        }
    }
};

/**
 * Constantes et Contextes Factices (channelSender)
 */
export const forwardedContext = {
    forwardingScore: 99,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: "120363422991829376@newsletter",
        newsletterName: "К•Л–НңНЎЛ–К” 𝐊𝐔𝐑𝐎𝐍𝐀 𝐗𝐌𝐃 ┇ 𝐀𝐍𝐃𝐄𝐋-𝐂𝐄𝐕𝐈𝐋 𝐓𝐄𝐂𝐇 К•Л–НңНЎЛ–К”",
        serverMessageId: 10,
    }
};

export const orderfake = {
    orderMessage: {
        orderId: "594071395007984",
        thumbnail: null,
        itemCount: 3500,
        status: "INQUIRY",
        surface: "CATALOG",
        message: "☕ 𝐂𝐄𝐕☘𝐊𝐔𝐑𝐎𝐍𝐀\n☘️ 𝐕𝐄𝐑𝐒𝐈𝐎𝐍 𝟏.𝟎.𝟎-𝐕𝐈𝐏",
        orderTitle: "𝐂𝐄𝐕☘𝐊𝐔𝐑𝐎𝐍𝐀",
        sellerJid: "237659407107@s.whatsapp.net",
        token: "AR40+xXRlWKpdJ2ILEqtgoUFd45C8rc1CMYdYG/R2KXrSg==",
        totalAmount1000: "3500",
        totalCurrencyCode: "XAF"
    }
};

export const paymentfake = {
    requestPaymentMessage: {
        currencyCodeIso4217: "USD",
        amount1000: "999999999",
        requestFrom: "0@s.whatsapp.net",
        noteMessage: {
            extendedTextMessage: {
                text: "🫟 クレイジー•𝐊𝐔𝐑𝐎𝐍𝐀",
            }
        },
        expiryTimestamp: "999999999"
    }
};

export const spoofedkey = {
    remoteJid: "status@broadcast",
    fromMe: false,
    id: "𝘺𝘄𝘁𝘺𝘵𝘰_𝘇𝘺𝘴_𝘵𝘦𝘹𝘵𝘺𝘵𝘴",
    participant: "0@s.whatsapp.net"
};

export async function externalAd(pushname: string, thumbBuffer?: Buffer | null) {
    let randomThumbBuffer = thumbBuffer || mediaUtils.getRandomImage();
    const resizedThumb = randomThumbBuffer ? await mediaUtils.resizeThumbnail(randomThumbBuffer, 200, 150) : null;

    return {
        externalAdReply: {
            title: `${pushname} 𝐕𝐄𝐑𝐒𝐈𝐎𝐍 𝐕𝐎 𝐊𝐔𝐑𝐎𝐍𝐀 𝐗𝐌𝐃`,
            body: `𝐓𝐡𝐞 𝐔𝐥𝐭𝐢𝐦𝐚𝐭𝐞 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐄𝐱𝐩𝐞𝐫𝐢𝐞𝐧𝐜𝐞`,
            mediaType: 1,
            ...(resizedThumb ? { thumbnail: resizedThumb } : {}),
            renderLargerThumbnail: false,
            sourceUrl: "https://whatsapp.com/channel/0029VbAfBueEKyZLIGi3Yx41",
        }
    };
}

export async function channelSender(ctx: CommandContext, texts: string, num: string, options: any = {}) {
    const pushname = ctx.senderName || "User";
    const fixedImagePath = path.resolve('assets', 'images', `${num}.png`);
    const randomImageBuffer = mediaUtils.getRandomImage();

    await ctx.sock.sendMessage(ctx.remoteJid, {
        image: { url: fixedImagePath },
        caption: texts,
        contextInfo: {
            ...forwardedContext,
            ...(await externalAd(pushname, randomImageBuffer))
        }
    }, {
        quoted: {
            key: spoofedkey,
            message: {
                conversation: `${pushname} 𝐈'𝐌 𝐊𝐔𝐑𝐎𝐍𝐀-𝐗𝐌𝐃 𝐁𝐘 𝐃𝐄𝐕 𝐊𝐔𝐑𝐎𝐍𝐀`
            }
        }
    });

    if (options.payment) await ctx.sock.sendMessage(ctx.remoteJid, paymentfake as any);
    if (options.order) {
        const resizedOrderThumb = randomImageBuffer ? await mediaUtils.resizeThumbnail(randomImageBuffer, 150, 150) : null;
        const orderWithThumb = {
            orderMessage: {
                ...orderfake.orderMessage,
                thumbnail: resizedOrderThumb
            }
        };
        await ctx.sock.sendMessage(ctx.remoteJid, orderWithThumb as any);
    }
}

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
        return db.get('isPublic') !== false;
    },
    setPublic(status: boolean) {
        const db = new JSONDatabase('config.json');
        db.set('isPublic', status);
    }
};

export const createManagers = (botId: string, owner: string) => ({
    members: { botId },
    permissions: { owner, botId },
    antispam: { db: new JSONDatabase('antispam_scores.json') }
});
