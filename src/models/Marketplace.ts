import db from '../config/database.js';

export interface MarketplaceBot {
    id: number;
    userId: number;
    name: string;
    description: string;
    logo?: string;
    commandCount: number;
    downloadType: 'github' | 'mediafire' | 'direct';
    downloadUrl: string;
    price: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

export interface Review {
    id: number;
    botId: number;
    userId: number;
    rating: number;
    comment: string;
    username?: string;
    createdAt: string;
}

export const MarketplaceModel = {
    findAllApproved: (): (MarketplaceBot & { rating: number, reviewCount: number })[] => {
        return db.prepare(`
            SELECT b.*, 
                   IFNULL(AVG(r.rating), 0) as rating, 
                   COUNT(r.id) as reviewCount
            FROM marketplace_bots b
            LEFT JOIN marketplace_reviews r ON b.id = r.botId
            WHERE b.status = 'approved'
            GROUP BY b.id
            ORDER BY b.createdAt DESC
        `).all() as any[];
    },

    findById: (id: number): MarketplaceBot | undefined => {
        return db.prepare('SELECT * FROM marketplace_bots WHERE id = ?').get(id) as MarketplaceBot | undefined;
    },

    createBot: (data: Partial<MarketplaceBot>): number => {
        const info = db.prepare(`
            INSERT INTO marketplace_bots (userId, name, description, logo, commandCount, downloadType, downloadUrl, price, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            data.userId,
            data.name,
            data.description,
            data.logo,
            data.commandCount,
            data.downloadType,
            data.downloadUrl,
            data.price || 0,
            data.status || 'pending'
        );
        return info.lastInsertRowid as number;
    },

    findPending: (): MarketplaceBot[] => {
        return db.prepare('SELECT * FROM marketplace_bots WHERE status = "pending" ORDER BY createdAt ASC').all() as MarketplaceBot[];
    },

    updateBotStatus: (id: number, status: string) => {
        db.prepare('UPDATE marketplace_bots SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
    },

    getReviews: (botId: number): Review[] => {
        return db.prepare(`
            SELECT r.*, u.username
            FROM marketplace_reviews r
            JOIN users u ON r.userId = u.id
            WHERE r.botId = ?
            ORDER BY r.createdAt DESC
        `).all(botId) as Review[];
    },

    addReview: (data: Partial<Review>) => {
        db.prepare('INSERT INTO marketplace_reviews (botId, userId, rating, comment) VALUES (?, ?, ?, ?)')
            .run(data.botId, data.userId, data.rating, data.comment);
    }
};
