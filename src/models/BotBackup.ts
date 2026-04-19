import db from '../config/database.js';

export interface BotBackup {
  id: number;
  botId: number;
  config: string;
  version: number;
  createdAt: string;
}

export const BotBackupModel = {
  create: (botId: number, config: string) => {
    // Get current max version
    const lastVersion = db.prepare('SELECT MAX(version) as maxV FROM bot_backups WHERE botId = ?').get(botId) as { maxV: number | null };
    const nextVersion = (lastVersion.maxV || 0) + 1;
    
    db.prepare('INSERT INTO bot_backups (botId, config, version) VALUES (?, ?, ?)')
      .run(botId, config, nextVersion);
    
    // Keep only last 5 backups per bot to save space
    db.prepare(`
      DELETE FROM bot_backups 
      WHERE botId = ? AND id NOT IN (
        SELECT id FROM bot_backups WHERE botId = ? ORDER BY version DESC LIMIT 5
      )
    `).run(botId, botId);
  },

  findByBotId: (botId: number): BotBackup[] => {
    return db.prepare('SELECT * FROM bot_backups WHERE botId = ? ORDER BY version DESC').all(botId) as BotBackup[];
  },

  findById: (id: number): BotBackup | undefined => {
    return db.prepare('SELECT * FROM bot_backups WHERE id = ?').get(id) as BotBackup | undefined;
  }
};
