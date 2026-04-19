import db from '../config/database.js';

export interface ActionLog {
  id: number;
  userId: number;
  action: string;
  details: string;
  createdAt: string;
}

export const ActionLogModel = {
  create: (userId: number, action: string, details: string) => {
    db.prepare('INSERT INTO action_logs (userId, action, details) VALUES (?, ?, ?)').run(userId, action, details);
  },

  findByUserId: (userId: number, limit: number = 10): ActionLog[] => {
    return db.prepare('SELECT * FROM action_logs WHERE userId = ? ORDER BY createdAt DESC LIMIT ?').all(userId, limit) as ActionLog[];
  },

  findAll: (limit: number = 50): (ActionLog & { username: string })[] => {
    return db.prepare(`
      SELECT al.*, u.username 
      FROM action_logs al 
      JOIN users u ON al.userId = u.id 
      ORDER BY al.createdAt DESC 
      LIMIT ?
    `).all(limit) as (ActionLog & { username: string })[];
  }
};
