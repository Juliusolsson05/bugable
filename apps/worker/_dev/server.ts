import http from 'http';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from monorepo root
config({ path: join(__dirname, '..', '..', '..', '.env') });

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  // Parse route: /api/jobs/:jobId/run
  const match = req.url?.match(/\/api\/jobs\/([^/]+)\/run/);

  if (req.method === 'POST' && match) {
    const jobId = match[1];

    try {
      // Import handler dynamically
      const handlerModule = await import('../api/jobs/[jobId]/run.js');
      const handler = handlerModule.default;

      // Mock Vercel request
      const mockRequest = {
        method: 'POST',
        query: { jobId },
        body: null,
        headers: req.headers,
      };

      // Mock Vercel response
      const mockResponse = {
        status: (code: number) => ({
          json: (data: any) => {
            res.writeHead(code, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
          }
        })
      };

      await handler(mockRequest as any, mockResponse as any);
    } catch (error) {
      console.error('Handler error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Worker dev server running at http://localhost:${PORT}`);
  console.log(`   POST http://localhost:${PORT}/api/jobs/:jobId/run`);
});
