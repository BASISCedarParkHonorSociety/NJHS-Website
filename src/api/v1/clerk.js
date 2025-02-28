import { createClerkClient } from '@clerk/clerk-sdk-node';

if (!process.env.CLERK_KEY) {
  console.error('CLERK_KEY environment variable is not set. API calls will fail.');
}

export const clerkClient = createClerkClient({ 
  secretKey: process.env.CLERK_KEY 
});

console.log('Clerk client initialized with secret key:', !!process.env.CLERK_KEY);
