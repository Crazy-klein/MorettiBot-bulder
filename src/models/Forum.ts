import db from '../config/database.js';

export interface ForumCategory {
    id: number;
    name: string;
    description: string;
    icon: string;
    order: number;
}

export interface ForumTopic {
    id: number;
    categoryId: number;
    userId: number;
    title: string;
    content: string;
    views: number;
    isPinned: number;
    isLocked: number;
    username?: string;
    replyCount?: number;
    createdAt: string;
}

export interface ForumReply {
    id: number;
    topicId: number;
    userId: number;
    content: string;
    username?: string;
    createdAt: string;
}

export const ForumModel = {
    getCategories: (): ForumCategory[] => {
        return db.prepare('SELECT * FROM forum_categories ORDER BY "order" ASC').all() as ForumCategory[];
    },

    findCategoryById: (id: number): ForumCategory | undefined => {
        return db.prepare('SELECT * FROM forum_categories WHERE id = ?').get(id) as ForumCategory | undefined;
    },

    getTopicsByCategory: (categoryId: number): ForumTopic[] => {
        return db.prepare(`
            SELECT t.*, u.username, COUNT(r.id) as replyCount
            FROM forum_topics t
            JOIN users u ON t.userId = u.id
            LEFT JOIN forum_replies r ON t.id = r.topicId
            WHERE t.categoryId = ?
            GROUP BY t.id
            ORDER BY t.isPinned DESC, t.createdAt DESC
        `).all(categoryId) as ForumTopic[];
    },

    findTopicById: (id: number): ForumTopic | undefined => {
        return db.prepare(`
            SELECT t.*, u.username
            FROM forum_topics t
            JOIN users u ON t.userId = u.id
            WHERE t.id = ?
        `).get(id) as ForumTopic | undefined;
    },

    incrementTopicViews: (id: number) => {
        db.prepare('UPDATE forum_topics SET views = views + 1 WHERE id = ?').run(id);
    },

    createTopic: (data: Partial<ForumTopic>): number => {
        const info = db.prepare(`
            INSERT INTO forum_topics (categoryId, userId, title, content)
            VALUES (?, ?, ?, ?)
        `).run(data.categoryId, data.userId, data.title, data.content);
        return info.lastInsertRowid as number;
    },

    getReplies: (topicId: number): ForumReply[] => {
        return db.prepare(`
            SELECT r.*, u.username
            FROM forum_replies r
            JOIN users u ON r.userId = u.id
            WHERE r.topicId = ?
            ORDER BY r.createdAt ASC
        `).all(topicId) as ForumReply[];
    },

    createReply: (data: Partial<ForumReply>): number => {
        const info = db.prepare(`
            INSERT INTO forum_replies (topicId, userId, content)
            VALUES (?, ?, ?)
        `).run(data.topicId, data.userId, data.content);
        return info.lastInsertRowid as number;
    },

    reportReply: (replyId: number, userId: number, reason: string) => {
        db.prepare('INSERT INTO forum_reports (replyId, userId, reason) VALUES (?, ?, ?)').run(replyId, userId, reason);
    }
};
