import db from '../config/database.js';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: number;
  createdAt: string;
}

export const NotificationModel = {
  create: (userId: number, title: string, message: string, type: string = 'info') => {
    db.prepare('INSERT INTO notifications (userId, title, message, type) VALUES (?, ?, ?, ?)').run(userId, title, message, type);
  },

  findByUserId: (userId: number, limit: number = 20): Notification[] => {
    return db.prepare('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT ?').all(userId, limit) as Notification[];
  },

  countUnread: (userId: number): number => {
    const row = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0').get(userId) as { count: number };
    return row.count;
  },

  markAsRead: (id: number, userId: number) => {
    db.prepare('UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?').run(id, userId);
  },

  markAllAsRead: (userId: number) => {
    db.prepare('UPDATE notifications SET isRead = 1 WHERE userId = ?').run(userId);
  },

  delete: (id: number, userId: number) => {
    db.prepare('DELETE FROM notifications WHERE id = ? AND userId = ?').run(id, userId);
  }
};
