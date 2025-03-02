import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newsletterPath = path.join(__dirname, '../../../../data/newsletter.json');

export default async function handler(req, res) {
  try {
    try {
      await fs.access(newsletterPath);
    } catch (error) {
      await fs.writeFile(newsletterPath, JSON.stringify({ posts: [], files: {} }, null, 2));
    }

    const data = await fs.readFile(newsletterPath, 'utf8');
    const newsletter = JSON.parse(data);

    res.status(200).json({ posts: newsletter.posts });
  } catch (error) {
    console.error('Error getting newsletter posts:', error);
    res.status(500).json({ error: 'Failed to get newsletter posts' });
  }
}
