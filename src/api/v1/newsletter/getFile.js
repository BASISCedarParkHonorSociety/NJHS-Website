import { ensureNewsletterFile } from './utils.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const fileId = req.method === 'GET' ? req.query.id : req.body.fileId;

    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }

    const newsletter = await ensureNewsletterFile();

    const fileMetadata = newsletter.files[fileId];
    
    if (!fileMetadata) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = newsletter.files[fileId];
    
    if (req.method === 'GET') {
      if (file.data) {
        res.setHeader('Content-Type', file.type || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${file.name}"`);
        
        const buffer = Buffer.from(file.data, 'base64');
        res.send(buffer);
      } else {
        res.status(404).json({ error: 'File data not found' });
      }
    } else {
      res.status(200).json({ file: fileMetadata });
    }
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).json({ error: 'Failed to retrieve file' });
  }
}
