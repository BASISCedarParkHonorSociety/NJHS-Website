import fs from 'fs/promises';
import { ensureNewsletterFile, newsletterPath } from './utils.js';
import { clerkClient } from '../clerk.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      userId, 
      postId,
      title, 
      content, 
      tags = [],
      files = [],
      existingFiles = []
    } = req.body;

    const user = await clerkClient.users.getUser(userId);
    const role = user.publicMetadata.role;
    
    if (role !== 'admin' && role !== 'lead') {
      return res.status(403).json({ error: 'Unauthorized: Only admin and lead roles can edit newsletter posts' });
    }

    const newsletter = await ensureNewsletterFile();

    const postIndex = newsletter.posts.findIndex(post => post.id === postId);
    
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = newsletter.posts[postIndex];

    if (post.authorId !== userId && role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: You can only edit your own posts' });
    }

    post.title = title;
    post.content = content;
    post.tags = tags;
    post.lastUpdated = new Date().toISOString();

    if (post.files) {
      const existingFileIds = existingFiles.map(f => f.id);
      
      post.files = post.files.filter(file => existingFileIds.includes(file.id));
      
      Object.keys(newsletter.files).forEach(fileId => {
        if (newsletter.files[fileId].postId === post.id && !existingFileIds.includes(fileId)) {
          delete newsletter.files[fileId];
        }
      });
    } else {
      post.files = [];
    }

    if (files && files.length > 0) {
      for (const file of files) {
        const fileId = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const fileData = file.content.split(';base64,').pop();

        newsletter.files[fileId] = {
          name: file.name,
          type: file.type,
          authorId: userId,
          postId: post.id,
          uploadDate: new Date().toISOString(),
          data: fileData
        };
        
        post.files.push({
          id: fileId,
          name: file.name,
          type: file.type
        });
      }
    }

    newsletter.posts[postIndex] = post;

    await fs.writeFile(newsletterPath, JSON.stringify(newsletter, null, 2));

    res.status(200).json({ success: true, post });
  } catch (error) {
    console.error('Error updating newsletter post:', error);
    res.status(500).json({ error: 'Failed to update newsletter post' });
  }
}
