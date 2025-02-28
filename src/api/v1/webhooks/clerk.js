import { clerkClient } from '../clerk.js';
import crypto from 'crypto';

function verifyWebhookSignature(req, secret) {
  const svix_id = req.headers['svix-id'];
  const svix_timestamp = req.headers['svix-timestamp'];
  const svix_signature = req.headers['svix-signature'];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return false;
  }

  const body = JSON.stringify(req.body);
  const signaturePayload = `${svix_id}.${svix_timestamp}.${body}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(signaturePayload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(`v1,${signature}`),
    Buffer.from(svix_signature)
  );
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const webhookSecret = process.env.WEBHOOK_SS;
    if (!verifyWebhookSignature(req, webhookSecret)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { type, data } = req.body;
    console.log(`Webhook received: ${type}`);

    if (type === 'user.created') {
      const { id: userId } = data;
      console.log(`Initializing metadata for user: ${userId}`);

      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: 'user',
          hours: 0,
          committee: 'none',
        },
      });

      console.log(`User metadata initialized for: ${userId}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
