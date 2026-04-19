import db from '../config/database.js';

export interface Bot {
  id: number;
  userId: number;
  name: string;
  type: string;
  prefix: string;
  config: string;
  status: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}

export const BotModel = {
  create: (data: Partial<Bot>): number => {
    const info = db.prepare(
      'INSERT INTO bots (userId, name, type, prefix, config, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(data.userId, data.name, data.type, data.prefix || '.', data.config, data.status || 'draft');
    return info.lastInsertRowid as number;
  },

  update: (id: number, data: Partial<Bot>) => {
    const fields = Object.keys(data).filter(k => k !== 'id');
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => (data as any)[f]);
    
    db.prepare(`UPDATE bots SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`).run(...values, id);
  },

  delete: (id: number, userId: number) => {
    db.prepare('DELETE FROM bots WHERE id = ? AND userId = ?').run(id, userId);
  },

  findById: (id: number): Bot | undefined => {
    return db.prepare('SELECT * FROM bots WHERE id = ?').get(id) as Bot | undefined;
  },

  findByUserId: (userId: number): Bot[] => {
    return db.prepare('SELECT * FROM bots WHERE userId = ? ORDER BY createdAt DESC').all(userId) as Bot[];
  },

  updateStatus: (id: number, status: string) => {
    db.prepare('UPDATE bots SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
  },

  setSession: (id: number, sessionId: string | null) => {
    db.prepare('UPDATE bots SET sessionId = ? WHERE id = ?').run(sessionId, id);
  },

  countAll: (): number => {
    const row = db.prepare('SELECT COUNT(*) as count FROM bots').get() as { count: number };
    return row.count;
  },

  countActiveSessions: (): number => {
    const row = db.prepare("SELECT COUNT(*) as count FROM bots WHERE status = 'running'").get() as { count: number };
    return row.count;
  }
};
