import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newsletterPath = path.join(__dirname, '../../../../data/newsletter.json');
const dataDir = path.dirname(newsletterPath);

export async function ensureNewsletterFile() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    
    try {
      await fs.access(newsletterPath);
      const data = await fs.readFile(newsletterPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      const defaultContent = { posts: [], files: {} };
      await fs.writeFile(newsletterPath, JSON.stringify(defaultContent, null, 2));
      return defaultContent;
    }
  } catch (error) {
    console.error('Error ensuring newsletter file exists:', error);
    throw error;
  }
}

export { newsletterPath };
