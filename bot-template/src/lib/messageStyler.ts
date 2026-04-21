import { config } from '../config.js';

// Style par défaut (Kurona)
const defaultStyle = {
  topLeft: '╔', 
  topRight: '╗', 
  bottomLeft: '╚', 
  bottomRight: '╝',
  horizontal: '┅', 
  vertical: '┊',
  leftPrefix: '寂',
  titleSeparator: '❍   ❍',
  linePrefix: '┊┊'
};

// Fonction qui retourne le style actif
function getActiveStyle() {
  if (!config.messageStyle?.enabled) return null;
  if (config.messageStyle?.preset === 'custom' && config.messageStyle?.custom) {
    return config.messageStyle.custom;
  }
  return defaultStyle;
}

/**
 * Formate un message avec des bordures ASCII stylisées
 */
export function formatMessage(title: string, content: string | string[], footer?: string): string {
  const style = getActiveStyle();
  if (!style) {
    return Array.isArray(content) ? content.join('\n') : content;
  }

  const lines = Array.isArray(content) ? content : [content];
  const topBorder = style.horizontal.repeat(20);
  
  let message = `> ${style.leftPrefix}${style.topLeft}${topBorder}${style.titleSeparator}${topBorder}${style.topRight}\n`;
  message += `> ${style.leftPrefix}${style.vertical} ${title.toUpperCase()}\n`;
  message += `> ${style.leftPrefix}${style.bottomLeft}${style.titleSeparator}${topBorder}${style.bottomRight}\n`;
  message += `> ${style.leftPrefix}${style.topLeft}${topBorder}${style.titleSeparator}${topBorder}${style.topRight}\n`;
  
  lines.forEach(line => {
    message += `> ${style.leftPrefix}${style.linePrefix} ${line}\n`;
  });
  
  if (footer) {
    message += `> ${style.leftPrefix}${style.linePrefix} ${footer}\n`;
  }
  
  message += `> ${style.leftPrefix}${style.bottomLeft}${style.titleSeparator}${topBorder}${style.bottomRight}`;
  return message;
}

export const messageStyler = {
  formatMessage,
  header: (text: string) => {
      const style = getActiveStyle();
      if (!style) return text.toUpperCase();
      const border = style.horizontal.repeat(10);
      return `> ${style.leftPrefix}${style.topLeft}${border} ${text.toUpperCase()} ${border}${style.topRight}`;
  },
  footer: (text?: string) => {
      const style = getActiveStyle();
      if (!style) return text || '';
      const border = style.horizontal.repeat(20);
      return `> ${style.leftPrefix}${style.bottomLeft}${border}${style.titleSeparator}${border}${style.bottomRight}${text ? '\n> ' + text : ''}`;
  },
  item: (text: string) => {
      const style = getActiveStyle();
      if (!style) return `• ${text}`;
      return `> ${style.leftPrefix}${style.linePrefix} ❍ ${text}`;
  },
  divider: () => {
      const style = getActiveStyle();
      if (!style) return '-------------------';
      const border = style.horizontal.repeat(15);
      return `> ${style.leftPrefix}┣${border}${style.titleSeparator}${border}┫`;
  },
  box: (title: string, content: string[]) => {
      return formatMessage(title, content);
  }
};
