import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { POST, GET, PUT, PATCH, DELETE } from './api/analyze.js';

const PORT = 3000;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // API 라우팅
  if (url.pathname === '/api/analyze') {
    let body = '';
    for await (const chunk of req) body += chunk;
    const request = new Request(`http://localhost:${PORT}${req.url}`, {
      method: req.method,
      headers: req.headers,
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? body : undefined
    });

    let apiRes;
    if (req.method === 'POST') apiRes = await POST(request);
    else if (req.method === 'GET') apiRes = GET();
    else if (req.method === 'PUT') apiRes = PUT();
    else if (req.method === 'PATCH') apiRes = PATCH();
    else if (req.method === 'DELETE') apiRes = DELETE();
    else apiRes = new Response('Method Not Allowed', { status: 405 });

    res.statusCode = apiRes.status;
    apiRes.headers.forEach((v, k) => res.setHeader(k, v));
    const resBody = await apiRes.text();
    res.end(resBody);
    return;
  }

  // 정적 파일 서빙 (public 디렉터리)
  let filePath = path.join(process.cwd(), 'public', url.pathname === '/' ? 'index.html' : url.pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Mood Lens server running at http://localhost:${PORT}`);
});
