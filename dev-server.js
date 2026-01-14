// Development server that handles both frontend and API routes
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Import API handler
import leadsHandler from './api/leads/route.ts';

// API Routes
app.post('/api/leads', async (req, res) => {
  try {
    // Create mock Vercel request/response objects
    const vercelReq = {
      method: 'POST',
      body: req.body,
      headers: req.headers,
      query: req.query,
    };
    
    const vercelRes = {
      status: (code) => ({
        json: (data) => res.status(code).json(data),
        end: () => res.status(code).end(),
      }),
      setHeader: (name, value) => res.setHeader(name, value),
      json: (data) => res.json(data),
    };

    await leadsHandler(vercelReq, vercelRes);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', savedLocally: false });
  }
});

// Create Vite server
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'custom',
});

// Use Vite's connect instance as middleware
app.use(vite.ssrLoadModule);

// Serve static files and handle SPA routing
app.use('*', async (req, res, next) => {
  try {
    const url = req.originalUrl;
    
    // Don't handle API routes here
    if (url.startsWith('/api/')) {
      return next();
    }

    // Load the index.html
    const template = await vite.transformIndexHtml(url, `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Najot Nur Notiqlik Markazi</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="/src/main.tsx"></script>
        </body>
      </html>
    `);
    
    res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
  } catch (error) {
    vite.ssrFixStacktrace(error);
    next(error);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});