export const messageStyler = {
  /**
   * Formate un message avec le style décoratif "Kurona"
   */
  formatMessage: (title: string, content: string | string[], footer?: string) => {
    const lines = Array.isArray(content) ? content : [content];
    let message = `┏━━━━━━━━━━━━━━━━━━━━━┓\n`;
    message += `┃  ◈ ${title.toUpperCase()} ◈\n`;
    message += `┣━━━━━━━━━━━━━━━━━━━━━┛\n`;
    message += `┃\n`;
    
    lines.forEach(line => {
      message += `┃ ❯ ${line}\n`;
    });
    
    if (footer) {
      message += `┃\n`;
      message += `┣━━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `┃ ✎ ${footer}\n`;
    }
    
    message += `┗━━━━━━━━━━━━━━━━━━━━━━`;
    return message;
  },

  header: (text: string) => `╔═══ ⊰ ${text} ⊱ ═══╗`,
  footer: () => `╚════════════════════╝`,
  item: (text: string) => `║ ❯ ${text}`,
  divider: () => `║ ───────────────────`,
  box: (title: string, content: string[]) => {
    let out = `╔═══ ⊰ ${title} ⊱ ═══╗\n`;
    content.forEach(line => out += `║ ${line}\n`);
    out += `╚════════════════════╝`;
    return out;
  }
};
