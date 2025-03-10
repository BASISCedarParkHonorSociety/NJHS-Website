import { ensureNewsletterFile, updateNewsletterFile } from './utils.js';
import { clerkClient } from '../clerk.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, postId } = req.body;

    const user = await clerkClient.users.getUser(userId);
    const role = user.publicMetadata.role;
    
    if (role !== 'admin' && role !== 'lead') {
      return res.status(403).json({ error: 'Unauthorized: Only admin and lead roles can delete newsletter posts' });
    }

    const newsletter = await ensureNewsletterFile();

    const postIndex = newsletter.posts.findIndex(post => post.id === postId);
    
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = newsletter.posts[postIndex];

    if (post.authorId !== userId && role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: You can only delete your own posts' });
    }

    const fileIdsToDelete = post.files ? post.files.map(file => file.id) : [];
    
    newsletter.posts.splice(postIndex, 1);
    
    for (const fileId of fileIdsToDelete) {
      if (newsletter.files[fileId]) {
        delete newsletter.files[fileId];
      }
    }

    await updateNewsletterFile(newsletter);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting newsletter post:', error);
    res.status(500).json({ error: 'Failed to delete newsletter post' });
  }
}
