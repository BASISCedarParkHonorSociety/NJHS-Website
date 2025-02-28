import { clerkClient } from '../clerk.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(400).send('GET request sent to a POST endpoint');
    return;
  }

  const { userID } = req.body;

  try {
    const user = await clerkClient.users.getUser(userID);
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving user');
  }
}
