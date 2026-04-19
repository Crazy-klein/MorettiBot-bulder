import db from '../config/database.js';

export const SettingModel = {
    get: (key: string): string | undefined => {
        const res = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
        return res?.value;
    },

    set: (key: string, value: string) => {
        db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
    }
};
