import { CommandContext } from '../../types/index.js';
import { formatMessage } from '../../lib/messageStyler.js';
import { permissions, miscUtils } from '../../lib/utils.js';
import { config } from '../../config.js';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export default {
    name: 'gitclone',
    aliases: ['git'],
    description: 'Clone un dépôt GitHub et l\'envoie en ZIP (Owner uniquement)',
    category: 'Owner',
    async execute(ctx: CommandContext) {
        if (!permissions.isOwner(ctx.sender, config.ownerNumber)) return;

        const url = ctx.args[0];
        if (!url || !url.includes('github.com')) {
            return await ctx.sock.sendMessage(ctx.remoteJid, { text: 'Veuillez fournir une URL GitHub valide.' });
        }

        const repoName = url.split('/').pop()?.replace('.git', '') || 'repo';
        const tempDir = path.join(process.cwd(), `temp_${Date.now()}`);
        const zipFile = `${tempDir}.zip`;

        try {
            await ctx.sock.sendMessage(ctx.remoteJid, { text: `⏳ _Clonage de "${repoName}" en cours..._` });

            // Clone
            await execPromise(`git clone --depth 1 "${url}" "${tempDir}"`);

            // Zip
            const output = fs.createWriteStream(zipFile);
            const archive = archiver('zip', { zlib: { level: 9 } });

            await new Promise((resolve, reject) => {
                output.on('close', resolve);
                archive.on('error', reject);
                archive.pipe(output);
                archive.directory(tempDir, false);
                archive.finalize();
            });

            // Send
            const stats = fs.statSync(zipFile);
            const size = miscUtils.formatBytes(stats.size);

            await ctx.sock.sendMessage(ctx.remoteJid, {
                document: { url: zipFile },
                mimetype: 'application/zip',
                fileName: `${repoName}.zip`,
                caption: formatMessage('GitClone', `Dépôt: ${repoName}\nTaille: ${size}\nSource: ${url}`)
            });

        } catch (e: any) {
            console.error('Error gitclone:', e);
            await ctx.sock.sendMessage(ctx.remoteJid, { text: `❌ Erreur: ${e.message}` });
        } finally {
            if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
            if (fs.existsSync(zipFile)) fs.unlinkSync(zipFile);
        }
    }
};
