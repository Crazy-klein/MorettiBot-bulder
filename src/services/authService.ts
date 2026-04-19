import bcrypt from 'bcrypt';
import { UserModel } from '../models/User.js';

export const AuthService = {
  hashPassword: async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10);
  },

  comparePassword: async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
  }
};
