import { createServer } from 'http';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env
config({ path: join(__dirname, '.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PORT = 3001;

if (!GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY in .env');
  process.exit(1);
}

const server = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Serve HTML
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const html = readFileSync(join(__dirname, 'index.html'), 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  // Gemini chain API (multi-turn conversation)
  if (req.method === 'POST' && req.url === '/api/gemini/chain') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { contents } = JSON.parse(body);

        if (!contents || !Array.isArray(contents)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Contents array is required' }));
          return;
        }

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': GEMINI_API_KEY
            },
            body: JSON.stringify({ contents })
          }
        );

        const data = await geminiRes.json();

        if (!geminiRes.ok) {
          console.error('Gemini error:', JSON.stringify(data, null, 2));
          res.writeHead(geminiRes.status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: data.error?.message || 'Gemini API error' }));
          return;
        }

        const partsOut = data?.candidates?.[0]?.content?.parts ?? [];
        const responseText = partsOut.map(p => p.text).filter(Boolean).join('\n') || 'No response';

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ response: responseText }));
      } catch (err) {
        console.error('Error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Gemini API proxy (single message)
  if (req.method === 'POST' && req.url === '/api/gemini') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { prompt, image } = JSON.parse(body);

        if (!prompt && !image) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Prompt or image is required' }));
          return;
        }

        // Build parts array for Gemini (image first, then text)
        const parts = [];

        if (image) {
          parts.push({
            inlineData: {
              mimeType: image.mimeType,
              data: image.data
            }
          });
        }

        if (prompt) {
          parts.push({ text: prompt });
        }

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': GEMINI_API_KEY
            },
            body: JSON.stringify({
              contents: [{ parts }]
            })
          }
        );

        const data = await geminiRes.json();

        if (!geminiRes.ok) {
          console.error('Gemini error:', JSON.stringify(data, null, 2));
          res.writeHead(geminiRes.status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: data.error?.message || 'Gemini API error' }));
          return;
        }

        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ response: responseText }));
      } catch (err) {
        console.error('Error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
});
