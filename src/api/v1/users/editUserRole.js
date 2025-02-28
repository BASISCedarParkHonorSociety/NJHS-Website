import { clerkClient } from '../clerk.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    console.log("Request body:", req.body);
    const { userID, role } = req.body;

    const user = await clerkClient.users.getUser(userID);
    const currentMetadata = user.publicMetadata || {};

    await clerkClient.users.updateUserMetadata(userID, {
      publicMetadata: {
        ...currentMetadata,
        role: role,
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
