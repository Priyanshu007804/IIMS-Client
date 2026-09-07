import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const TARGET_BACKEND = 'https://intelligent-incident-management.onrender.com';

async function startServer() {
  const app = express();

  // Root health check endpoint for Cloud Run and external monitoring
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'IIMS Production Gateway',
      timestamp: new Date().toISOString(),
    });
  });

  // Proxy endpoint for IIMS Spring Boot REST API
  app.all('/proxy-api*', async (req, res) => {
    const backendPath = req.originalUrl.replace(/^\/proxy-api/, '/api');
    const targetUrl = `${TARGET_BACKEND}${backendPath}`;

    try {
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        const lowerKey = key.toLowerCase();
        if (lowerKey !== 'host' && lowerKey !== 'connection' && lowerKey !== 'content-length') {
          if (typeof value === 'string') {
            headers[lowerKey] = value;
          } else if (Array.isArray(value)) {
            headers[lowerKey] = value.join(',');
          }
        }
      }

      // Read incoming body stream if present
      let bodyData: Buffer | undefined;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        if (chunks.length > 0) {
          bodyData = Buffer.concat(chunks);
        }
      }

      const upstreamRes = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: bodyData,
      });

      res.status(upstreamRes.status);
      upstreamRes.headers.forEach((val, key) => {
        const lowerKey = key.toLowerCase();
        if (lowerKey !== 'content-encoding' && lowerKey !== 'transfer-encoding') {
          res.setHeader(key, val);
        }
      });

      const arrayBuffer = await upstreamRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      console.error(`[Proxy Error] ${req.method} ${targetUrl}:`, err);
      res.status(502).json({
        error: 'Bad Gateway',
        message: err.message || 'Error communicating with upstream Spring Boot backend',
      });
    }
  });

  // Proxy endpoint for backend health ping
  app.all('/proxy-health*', async (req, res) => {
    const backendPath = req.originalUrl.replace(/^\/proxy-health/, '/health');
    const targetUrl = `${TARGET_BACKEND}${backendPath}`;

    try {
      const upstreamRes = await fetch(targetUrl, {
        method: req.method,
      });

      res.status(upstreamRes.status);
      const arrayBuffer = await upstreamRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      res.status(503).json({
        status: 'DOWN',
        error: 'Upstream unavailable',
        message: err.message,
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IIMS Server running on http://0.0.0.0:${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
