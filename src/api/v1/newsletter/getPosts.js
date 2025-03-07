import { ensureNewsletterFile } from './utils.js';

export default async function handler(req, res) {
  try {
    const newsletter = await ensureNewsletterFile();
    const postsWithUrls = newsletter.posts.map(post => ({
      ...post,
      url: `/newsletter/${post.id}`
    }));
    res.status(200).json({ posts: postsWithUrls });
  } catch (error) {
    console.error('Error getting newsletter posts:', error);
    res.status(500).json({ error: 'Failed to get newsletter posts' });
  }
}
