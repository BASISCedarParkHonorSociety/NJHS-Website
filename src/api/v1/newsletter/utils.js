import { Client } from 'basic-ftp';
import { Writable, Readable } from 'stream';

const FTP_CONFIG = {
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASS,
  port: parseInt(process.env.FTP_PORT) || 21
};

const REMOTE_PATH = '/home/basiqqrp/njhs/data/newsletter.json';

async function getClient() {
  const client = new Client();
  try {
    await client.access(FTP_CONFIG);
    return client;
  } catch (error) {
    console.error('FTP connection error:', error);
    throw new Error('Failed to connect to FTP server');
  }
}

class ContentCollector extends Writable {
  constructor() {
    super();
    this.content = '';
  }
  
  _write(chunk, encoding, callback) {
    this.content += chunk.toString();
    callback();
  }
}

async function readRemoteFile() {
  let client;
  try {
    client = await getClient();
    
    const collector = new ContentCollector();
    await client.downloadTo(collector, REMOTE_PATH);
    
    return collector.content ? JSON.parse(collector.content) : { posts: [], files: {} };
  } catch (error) {
    if (error.code === 550) { // File not found
      return { posts: [], files: {} };
    }
    throw error;
  } finally {
    if (client) {
      client.close();
    }
  }
}

async function writeRemoteFile(data) {
  let client;
  try {
    client = await getClient();
    
    const content = JSON.stringify(data, null, 2);
    const stream = Readable.from([content]);
    
    await client.ensureDir('/home/basiqqrp/njhs/data');
    
    await client.uploadFrom(stream, REMOTE_PATH);
  } finally {
    if (client) {
      client.close();
    }
  }
}

export async function ensureNewsletterFile() {
  try {
    const data = await readRemoteFile();
    return data;
  } catch (error) {
    console.error('Error ensuring newsletter file exists:', error);
    throw error;
  }
}

export async function updateNewsletterFile(data) {
  try {
    await writeRemoteFile(data);
  } catch (error) {
    console.error('Error updating newsletter file:', error);
    throw error;
  }
}

export { REMOTE_PATH as newsletterPath };
