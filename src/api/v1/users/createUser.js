import { clerkClient } from '../clerk.js';


export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    console.log("Request body:", req.body);
    const { firstName, lastName, email, role, committee, password } = req.body;

    if (!firstName || !lastName || !email || !role || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    try {
      const username = firstName.toLowerCase() + '-' + lastName.toLowerCase();
      
      const user = await clerkClient.users.createUser({
        firstName,
        lastName,
        username,
        emailAddress: [email],
        password,
        publicMetadata: {
          role: role,
          committee: committee || "none",
          hours: 0
        },
        skipPasswordChecks: true
      });

      res.status(200).json({ success: true, userId: user.id });
    } catch (error) {
      console.error('Clerk API error:', error);
      
      if (error.errors && error.errors.length > 0) {
        const errorMessages = error.errors.map(err => `${err.message} (${err.longMessage || ''})`).join(', ');
        res.status(422).json({ error: errorMessages });
      } else {
        res.status(500).json({ error: error.message || 'Error creating user' });
      }
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
