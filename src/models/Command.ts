import db from '../config/database.js';

export interface Command {
    id: number;
    name: string;
    category: string;
    key: string;
    description: string;
    isFree: number;
    isActive: number;
    createdAt: string;
    updatedAt: string;
}

export const CommandModel = {
    findAll: (): Command[] => {
        return db.prepare('SELECT * FROM commands ORDER BY category ASC, name ASC').all() as Command[];
    },

    findActive: (): Command[] => {
        return db.prepare('SELECT * FROM commands WHERE isActive = 1 ORDER BY id ASC').all() as Command[];
    },

    findFreeActive: (): Command[] => {
        return db.prepare('SELECT * FROM commands WHERE isActive = 1 AND isFree = 1 ORDER BY id ASC').all() as Command[];
    },

    update: (id: number, data: Partial<Command>) => {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);
        db.prepare(`UPDATE commands SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`)
            .run(...values, id);
    }
};
