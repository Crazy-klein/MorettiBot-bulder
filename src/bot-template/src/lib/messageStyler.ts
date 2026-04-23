import { config } from '../config.js';

interface StyleConfig {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  horizontal: string;
  vertical: string;
  leftPrefix: string;
  titleSeparator: string;
  linePrefix: string;
}

const defaultStyle: StyleConfig = {
  topLeft: '╔',
  topRight: '╗',
  bottomLeft: '╚',
  bottomRight: '╝',
  horizontal: '┅',
  vertical: '┊┊',
  leftPrefix: '❍',
  titleSeparator: '寂',
  linePrefix: '❯'
};

const getActiveStyle = (): StyleConfig | null => {
  if (!config.messageStyle?.enabled) return null;
  if (config.messageStyle.preset === 'custom' && config.messageStyle.custom) {
    return {
      topLeft: config.messageStyle.custom.topLeft || defaultStyle.topLeft,
      topRight: config.messageStyle.custom.topRight || defaultStyle.topRight,
      bottomLeft: config.messageStyle.custom.bottomLeft || defaultStyle.bottomLeft,
      bottomRight: config.messageStyle.custom.bottomRight || defaultStyle.bottomRight,
      horizontal: config.messageStyle.custom.horizontal || defaultStyle.horizontal,
      vertical: config.messageStyle.custom.vertical || defaultStyle.vertical,
      leftPrefix: config.messageStyle.custom.leftPrefix || defaultStyle.leftPrefix,
      titleSeparator: config.messageStyle.custom.titleSeparator || defaultStyle.titleSeparator,
      linePrefix: config.messageStyle.custom.linePrefix || defaultStyle.linePrefix
    };
  }
  return defaultStyle;
};

export const formatMessage = (title: string, content: string | string[], footer?: string) => {
  const style = getActiveStyle();
  if (!style) return Array.isArray(content) ? content.join('\n') : content;

  const lines = Array.isArray(content) ? content : [content];
  const border = style.horizontal.repeat(20);
  
  let message = `${style.topLeft}${border}${style.topRight}\n`;
  message += `${style.vertical} ${style.titleSeparator} ${title.toUpperCase()} ${style.titleSeparator}\n`;
  message += `${style.bottomLeft}${border}${style.bottomRight}\n`;
  message += `${style.vertical}\n`;
  
  lines.forEach(line => {
    message += `${style.vertical} ${style.linePrefix} ${line}\n`;
  });
  
  if (footer) {
    message += `${style.vertical}\n`;
    message += `${style.topLeft}${border}\n`;
    message += `${style.vertical} ✎ ${footer}\n`;
  }
  
  message += `${style.bottomLeft}${border}${style.bottomRight}`;
  return message;
};

export const messageStyler = {
  header: (text: string) => {
    const style = getActiveStyle() || defaultStyle;
    return `${style.topLeft}${style.horizontal.repeat(3)} ${style.leftPrefix} ${text} ${style.leftPrefix} ${style.horizontal.repeat(3)}${style.topRight}`;
  },
  footer: () => {
    const style = getActiveStyle() || defaultStyle;
    return `${style.bottomLeft}${style.horizontal.repeat(20)}${style.bottomRight}`;
  },
  item: (text: string) => {
    const style = getActiveStyle() || defaultStyle;
    return `${style.vertical} ${style.linePrefix} ${text}`;
  },
  divider: () => {
    const style = getActiveStyle() || defaultStyle;
    return `${style.vertical} ${style.horizontal.repeat(15)}`;
  },
  box: (title: string, content: string[]) => {
    const style = getActiveStyle() || defaultStyle;
    let out = `${style.topLeft}${style.horizontal.repeat(3)} ${style.leftPrefix} ${title} ${style.leftPrefix} ${style.horizontal.repeat(3)}${style.topRight}\n`;
    content.forEach(line => out += `${style.vertical} ${line}\n`);
    out += `${style.bottomLeft}${style.horizontal.repeat(20)}${style.bottomRight}`;
    return out;
  }
};
