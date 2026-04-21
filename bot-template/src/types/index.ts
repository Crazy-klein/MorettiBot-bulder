import { WASocket, WAMessage } from '@whiskeysockets/baileys';

export interface CommandContext {
  sock: WASocket;
  msg: WAMessage;
  sender: string;
  remoteJid: string;
  text: string;
  args: string[];
  isGroup: boolean;
  quotedMessage: any | null;
  mentionedJid: string[];
  mediaType: 'image' | 'video' | 'audio' | 'sticker' | 'document' | null;
  fullArgs: string;
}

export interface Command {
    name: string;
    description: string;
    category: string;
    execute: (ctx: CommandContext) => Promise<void>;
}
