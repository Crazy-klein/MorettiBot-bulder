import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'kurona-secure-key-0987654321-at-least-32-chars';

/**
 * Utility for symmetric encryption of sensitive tokens like GitHub Access Tokens
 */
export const EncryptionUtils = {
  encrypt: (text: string): string => {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  },

  decrypt: (cipherText: string): string => {
    const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
};
