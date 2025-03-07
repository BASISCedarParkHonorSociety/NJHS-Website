import { clerkClient } from '../clerk.js';

export default async function handler(req, res) {
    try {
        if (req.method !== 'GET') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }

        const allUsers = [];
        let pageNumber = 0;
        let hasMorePages = true;
        
        while (hasMorePages) {
            const response = await clerkClient.users.getUserList({
                limit: 100,
                offset: pageNumber * 100,
            });

            const usersPage = response.data || response;
            
            if (!usersPage || usersPage.length === 0) {
                hasMorePages = false;
            } else {
                allUsers.push(...usersPage);
                pageNumber++;
            }
            
            if (pageNumber > 10) {
                break;
            }
        }

        res.status(200).json(allUsers);
    } catch (error) {
        console.error('Error fetching client list:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
