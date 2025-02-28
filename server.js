// Import required modules
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables
const isDev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 5174;

// Log environment variables for debugging (excluding sensitive values)
console.log('Environment variables loaded:');
console.log('CLERK_KEY present:', !!process.env.CLERK_KEY);
console.log('WEBHOOK_SS present:', !!process.env.WEBHOOK_SS);
console.log('VITE_CLERK_PUBLISHABLE_KEY present:', !!process.env.VITE_CLERK_PUBLISHABLE_KEY);

// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());

// Only serve static files in production mode
// In development mode, the Vite dev server will handle static files
if (!isDev) {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// CORS middleware for API routes
app.use('/api', (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    res.status(200).end();
    return;
  }
  next();
});

// Dynamic API route handler
app.use('/api', async (req, res, next) => {
  try {
    // Get the path without the /api prefix
    const apiPath = req.path;
    console.log(`API request received: ${req.method} ${apiPath}`);
    
    // Map the URL path to the file path
    // Make sure to include 'api' in the path
    const filePath = path.join(__dirname, 'src', 'api', apiPath);
    console.log(`Looking for handler at: ${filePath}.js`);
    
    // Check if the file exists
    if (fs.existsSync(`${filePath}.js`)) {
      console.log(`Handler file found: ${filePath}.js`);
      try {
        // Import the handler module (using dynamic import for ES modules)
        const modulePath = `file://${filePath}.js`;
        console.log(`Importing module from: ${modulePath}`);
        const module = await import(modulePath);
        
        if (!module.default) {
          console.error(`No default export found in ${filePath}.js`);
          return res.status(500).json({ error: 'API handler not properly exported' });
        }
        
        const handler = module.default;
        console.log(`Handler loaded, executing...`);
        
        // Call the handler function
        await handler(req, res);
      } catch (error) {
        console.error('Error importing or executing API handler:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
      }
    } else {
      // If no specific file is found, continue to the next middleware
      next();
    }
  } catch (error) {
    console.error('API route error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// For any other routes, serve the index.html in production mode
// In development mode, the Vite dev server will handle this
if (!isDev) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Start the server
app.listen(port, () => {
  console.log(`> Server running on http://localhost:${port}`);
});
