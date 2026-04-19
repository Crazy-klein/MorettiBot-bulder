import db from '../config/database.js';

export interface User {
  id: number;
  email: string;
  password?: string;
  username: string;
  role: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  createdAt: string;
  updatedAt: string;
}

export const UserModel = {
  findByEmail: (email: string): User | undefined => {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
  },

  findById: (id: number): User | undefined => {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  },

  create: (data: Partial<User>): number => {
    const info = db.prepare(
      'INSERT INTO users (email, password, username, role) VALUES (?, ?, ?, ?)'
    ).run(data.email, data.password, data.username, data.role || 'user');
    return info.lastInsertRowid as number;
  },

  updatePassword: (id: number, passwordHash: string) => {
    db.prepare('UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(passwordHash, id);
  },

  setResetToken: (email: string, token: string, expires: Date) => {
    db.prepare('UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ?, updatedAt = CURRENT_TIMESTAMP WHERE email = ?')
      .run(token, expires.toISOString(), email);
  },

  findByResetToken: (token: string): User | undefined => {
    return db.prepare('SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > CURRENT_TIMESTAMP').get(token) as User | undefined;
  },

  clearResetToken: (id: number) => {
    db.prepare('UPDATE users SET resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?').run(id);
  },

  findAll: (): User[] => {
    return db.prepare('SELECT id, email, username, role, createdAt FROM users ORDER BY createdAt DESC').all() as User[];
  },

  updateRole: (id: number, role: string) => {
    db.prepare('UPDATE users SET role = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(role, id);
  }
};
