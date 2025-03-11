import { clerkClient } from '../clerk.js';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, body, userId } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (userId) {
      const user = await clerkClient.users.getUser(userId);
      const role = user.publicMetadata.role;
      
      if (role !== 'admin' && role !== 'lead') {
        return res.status(403).json({ error: 'Unauthorized: Only admin and lead roles can send emails' });
      }
    } else {
      const apiSecret = req.headers['x-api-secret'];
      if (!apiSecret || apiSecret !== process.env.CLERK_KEY) {
        return res.status(403).json({ error: 'Unauthorized: Invalid or missing API secret' });
      }
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: body
    });

    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
