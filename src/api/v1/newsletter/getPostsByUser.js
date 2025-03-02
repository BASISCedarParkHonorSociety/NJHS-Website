import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { clerkClient } from '../clerk.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newsletterPath = path.join(__dirname, '../../../../data/newsletter.json');

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

    const data = await fs.readFile(newsletterPath, 'utf8');
    const newsletter = JSON.parse(data);

    const userPosts = newsletter.posts.filter(post => post.authorId === userId);

    res.status(200).json({ posts: userPosts });
  } catch (error) {
    console.error('Error getting user posts:', error);
    res.status(500).json({ error: 'Failed to get user posts' });
  }
}
