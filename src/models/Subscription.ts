import db from '../config/database.js';

export interface Subscription {
    id: number;
    userId: number;
    plan: 'free' | 'pro';
    status: 'active' | 'canceled' | 'expired';
    paymentMethod?: string;
    transactionId?: string;
    startDate?: string;
    endDate?: string;
    createdAt: string;
}

export const SubscriptionModel = {
    findByUserId: (userId: number): Subscription | undefined => {
        return db.prepare('SELECT * FROM subscriptions WHERE userId = ? ORDER BY createdAt DESC LIMIT 1').get(userId) as Subscription | undefined;
    },

    create: (data: Partial<Subscription>) => {
        return db.prepare(`
            INSERT INTO subscriptions (userId, plan, status, paymentMethod, transactionId, startDate, endDate)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            data.userId,
            data.plan || 'free',
            data.status || 'active',
            data.paymentMethod,
            data.transactionId,
            data.startDate,
            data.endDate
        ).lastInsertRowid as number;
    },

    update: (userId: number, data: Partial<Subscription>) => {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);
        db.prepare(`UPDATE subscriptions SET ${fields} WHERE userId = ? AND id = (SELECT id FROM subscriptions WHERE userId = ? ORDER BY createdAt DESC LIMIT 1)`)
            .run(...values, userId, userId);
    }
};
