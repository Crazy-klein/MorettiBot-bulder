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

    // Modifier le fichier de configuration dans le template
    const configFilePath = path.join(tempDir, 'src/config.ts');
    const configContent = `
export const config = {
  name: "${botConfig.name}",
  type: "${botConfig.type}",
  prefix: "${botConfig.prefix}",
  ownerName: "${botConfig.ownerName}",
  ownerNumber: "${botConfig.ownerNumber}",
  enabledModules: ${JSON.stringify(botConfig.modules)},
  version: "1.0.0"
};
`;
    await fs.writeFile(configFilePath, configContent);

    // Supprimer les modules non activés (facultatif mais recommandé pour la taille)
    const commandsDir = path.join(tempDir, 'src/commands');
    const allModules = ['ai', 'downloader', 'tools', 'group']; // Exemple de noms de dossiers
    
    for (const module of allModules) {
      if (!botConfig.modules.includes(module)) {
        const modulePath = path.join(commandsDir, module);
        if (await fs.pathExists(modulePath)) {
          await fs.remove(modulePath);
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
