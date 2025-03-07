import { ensureNewsletterFile } from './utils.js';
import { clerkClient } from '../clerk.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, requesterId } = req.body;

    const requester = await clerkClient.users.getUser(requesterId);
    const role = requester.publicMetadata.role;
    
    if (role !== 'admin' && role !== 'lead') {
      return res.status(403).json({ error: 'Unauthorized: Only admin and lead roles can access this endpoint' });
    }

    if (role !== 'admin' && userId !== requesterId) {
      return res.status(403).json({ error: 'Unauthorized: Only admins can view other users\' posts' });
    }

    const newsletter = await ensureNewsletterFile();
    const userPosts = newsletter.posts.filter(post => post.authorId === userId);

    const userPostsWithUrls = userPosts.map(post => ({
      ...post,
      url: `/newsletter/${post.id}`
    }));

    res.status(200).json({ posts: userPostsWithUrls });
  } catch (error) {
    console.error('Error getting user posts:', error);
    res.status(500).json({ error: 'Failed to get user posts' });
  }
}
