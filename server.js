const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  // AviationStack Live Proxy Route
  if (req.url.startsWith('/api/aviationstack')) {
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const depIata = urlObj.searchParams.get('dep_iata') || '';
    const arrIata = urlObj.searchParams.get('arr_iata') || '';
    const limit = urlObj.searchParams.get('limit') || '15';
    const key = urlObj.searchParams.get('access_key') || 'eaa8e2747dc1d145d534c593879a138b';

    let target = `http://api.aviationstack.com/v1/flights?access_key=${encodeURIComponent(key)}&limit=${limit}`;
    if (depIata) target += `&dep_iata=${encodeURIComponent(depIata)}`;
    if (arrIata) target += `&arr_iata=${encodeURIComponent(arrIata)}`;

    http.get(target, (apiRes) => {
      res.writeHead(apiRes.statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      apiRes.pipe(res);
    }).on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: { message: err.message } }));
    });
    return;
  }

  let safeUrl = decodeURI(req.url.split('?')[0]);
  let filePath = path.join(__dirname, safeUrl);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 Not Found</h1><p><a href="/">Return to Skyscanner</a></p>');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Server Error: ${err.code}`);
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Skyscanner local server is running at http://localhost:${PORT}`);
});
