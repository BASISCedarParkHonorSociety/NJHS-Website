# NJHS Website

The official website for the National Junior Honor Society at BASIS Cedar Park. Built with React, TypeScript, and Express.js.

## Features

- Authentication with Clerk
- Newsletter system
- Event management
- User role management
- Hour tracking system
- Synchronous and asynchronous activities

## Prerequisites

- Node.js (v18 or higher)
- npm (Node Package Manager)
- A Clerk account for authentication

## Environment Setup

1. Run `mv .env.local.example .env.local` file in the root directory
2. Edit all the environment variables in .env.local.

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/NJHS-Website.git
cd NJHS-Website
```

2. Install dependencies:
```bash
npm install
```

## Development

Run the development server:
```bash
npm run dev
```

This will start:
- Frontend development server (Vite)
- Backend API server (Express.js with hot reload)

The application will be available at:
- Frontend (with api at /api): http://localhost:5173
- Backend API: http://localhost:3000

## Production

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

The production build will be served from the Express.js server on port 3000.

## Project Structure

- `/src` - Frontend React application
  - `/api` - API routes and handlers
  - `/components` - Reusable UI components
  - `/pages` - Application pages
  - `/lib` - Utility functions and shared logic
- `/data` - Data storage
- `/public` - Static assets
- `/api` - Serverless infrastructure

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
