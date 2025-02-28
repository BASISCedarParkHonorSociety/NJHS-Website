import { clerkClient } from '../clerk.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'DELETE') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    console.log("Request body:", req.body);
    const { userID } = req.body;

    try {
      await clerkClient.users.getUser(userID);
    } catch (error) {
      if (error.status === 404) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      throw error;
    }

    await clerkClient.users.deleteUser(userID);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
