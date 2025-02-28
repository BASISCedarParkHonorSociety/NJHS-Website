import { clerkClient } from '../clerk.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const { userID, role, committee, hours } = req.body;

    await clerkClient.users.updateUserMetadata(userID, {
      publicMetadata: {
        role: role,
        committee: committee,
        hours: hours,
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating user metadata:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
