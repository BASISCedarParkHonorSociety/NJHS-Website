import { ensureNewsletterFile } from './utils.js';

export default async function handler(req, res) {
  try {
    const newsletter = await ensureNewsletterFile();
    res.status(200).json({ posts: newsletter.posts });
  } catch (error) {
    console.error('Error getting newsletter posts:', error);
    res.status(500).json({ error: 'Failed to get newsletter posts' });
  }
}
