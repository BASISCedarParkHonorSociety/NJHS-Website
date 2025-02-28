import { clerkClient } from '../clerk.js';

export default async function handler(req, res) {
    try {
        if (req.method !== 'GET') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }

        const clientList = await clerkClient.users.getUserList();
        res.status(200).json(clientList);
    } catch (error) {
        console.error('Error fetching client list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
