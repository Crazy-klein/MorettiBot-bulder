import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface BotConfig {
  name: string;
  type: string;
  prefix: string;
  ownerName: string;
  ownerNumber: string;
  modules: string[];
  style?: {
    enabled: boolean;
    preset: string;
    custom?: {
      topLeft: string;
      topRight: string;
      bottomLeft: string;
      bottomRight: string;
      horizontal: string;
      vertical: string;
      leftPrefix: string;
      titleSeparator: string;
      linePrefix: string;
    };
  };
}

export const BotGenerator = {
  generateZip: async (botConfig: BotConfig): Promise<string> => {
    const templatePath = path.resolve(__dirname, '../../bot-template');
    const tempDir = path.resolve(__dirname, `../../temp/${uuidv4()}`);
    const zipPath = `${tempDir}.zip`;

    // Créer le dossier temporaire
    await fs.ensureDir(tempDir);
    
    // Copier le template
    await fs.copy(templatePath, tempDir);

    // Charger et transformer le fichier de configuration
    const configFilePath = path.join(tempDir, 'src/config.ts');
    let configContent = await fs.readFile(configFilePath, 'utf-8');

    // Valeurs par défaut pour le style si non fourni
    const styleEnabled = botConfig.style?.enabled ?? true;
    const stylePreset = botConfig.style?.preset ?? 'kurona';
    const custom = botConfig.style?.custom || {
        topLeft: '╔', topRight: '╗', bottomLeft: '╚', bottomRight: '╝',
        horizontal: '┅', vertical: '┊', leftPrefix: '寂',
        titleSeparator: '❍   ❍', linePrefix: '┊┊'
    };

    // Remplacement des placeholders
    configContent = configContent
      .replace('{{BOT_NAME}}', botConfig.name)
      .replace('{{BOT_TYPE}}', botConfig.type)
      .replace('{{BOT_PREFIX}}', botConfig.prefix)
      .replace('{{OWNER_NAME}}', botConfig.ownerName)
      .replace('{{OWNER_NUMBER}}', botConfig.ownerNumber)
      .replace('{{ENABLED_MODULES}}', JSON.stringify(botConfig.modules))
      .replace('{{MESSAGE_STYLE_ENABLED}}', styleEnabled.toString())
      .replace('{{MESSAGE_STYLE_PRESET}}', stylePreset)
      .replace('{{CUSTOM_TOP_LEFT}}', custom.topLeft)
      .replace('{{CUSTOM_TOP_RIGHT}}', custom.topRight)
      .replace('{{CUSTOM_BOTTOM_LEFT}}', custom.bottomLeft)
      .replace('{{CUSTOM_BOTTOM_RIGHT}}', custom.bottomRight)
      .replace('{{CUSTOM_HORIZONTAL}}', custom.horizontal)
      .replace('{{CUSTOM_VERTICAL}}', custom.vertical)
      .replace('{{CUSTOM_LEFT_PREFIX}}', custom.leftPrefix)
      .replace('{{CUSTOM_TITLE_SEPARATOR}}', custom.titleSeparator)
      .replace('{{CUSTOM_LINE_PREFIX}}', custom.linePrefix);

    await fs.writeFile(configFilePath, configContent);

    // Supprimer les modules non autorisés du template
    const commandsDir = path.join(tempDir, 'src/commands');
    if (await fs.pathExists(commandsDir)) {
        const files = await fs.readdir(commandsDir);
        for (const file of files) {
            const moduleKey = file.split('.')[0];
            if (!botConfig.modules.includes(moduleKey)) {
                await fs.remove(path.join(commandsDir, file));
            }
        }
    }

    // Créer le ZIP
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => resolve(zipPath));
      archive.on('error', (err) => reject(err));

      archive.pipe(output);
      archive.directory(tempDir, false);
      archive.finalize();
    });
  },

  cleanup: async (filePath: string) => {
    try {
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
        // Si c'est un ZIP, supprimer aussi le dossier temp associé
        const dirPath = filePath.replace('.zip', '');
        if (await fs.pathExists(dirPath)) {
          await fs.remove(dirPath);
        }
      }
    } catch (err) {
      console.error('Erreur lors du nettoyage :', err);
    }
  }
};
