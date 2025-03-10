import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function handler(req, res) {
  try {
    const routePath = req.url.replace(/^\/api\/v1\/?/, '').split('?')[0];
    console.log(`API request received: ${req.method} ${routePath}`);

    const handlerPath = join(process.cwd(), 'src', 'api', 'v1', `${routePath}.js`);
    console.log(`Looking for handler at: ${handlerPath}`);

    try {
      const modulePath = `file://${handlerPath}`;
      console.log(`Importing module from: ${modulePath}`);
      const module = await import(modulePath);

      if (!module.default) {
        console.error(`No default export found in ${handlerPath}`);
        return res.status(500).json({ error: "API handler not properly exported" });
      }

      const handler = module.default;
      console.log(`Handler loaded, executing...`);

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }

      await handler(req, res);
    } catch (error) {
      console.error('Error importing or executing API handler:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  } catch (error) {
    console.error('API route error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}