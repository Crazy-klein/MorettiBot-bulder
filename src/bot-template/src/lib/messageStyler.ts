export const messageStyler = {
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
