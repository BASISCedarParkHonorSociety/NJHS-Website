import { ensureNewsletterFile } from './utils.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const postId = req.query.id;

    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    const newsletter = await ensureNewsletterFile();
    const post = newsletter.posts.find(p => p.id === postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const postWithUrl = {
      ...post,
      url: `/newsletter/${post.id}`
    };

    res.status(200).json({ post: postWithUrl });
  } catch (error) {
    console.error('Error getting newsletter post:', error);
    res.status(500).json({ error: 'Failed to get newsletter post' });
  }
}
