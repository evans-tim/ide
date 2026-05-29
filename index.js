const http = require('http');
const fs = require('fs');
const path = require('path');
const pty = require('node-pty');
const { WebSocketServer } = require('ws');

let mountedDir = process.cwd();

const types = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

const sendJson = (res, status, data) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const readBody = req => new Promise((resolve, reject) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => resolve(body));
  req.on('error', reject);
});

const walk = (dir, base = '') => {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, rel));
    else if (entry.isFile()) out.push(rel);
  }
  return out;
};

const filePath = name => {
  const full = path.resolve(mountedDir, name || '');
  if (full !== mountedDir && !full.startsWith(mountedDir + path.sep)) return null;
  return full;
};

const server = http.createServer((req, res) => {
  if (req.url === '/api/workspace' && req.method === 'GET') {
    sendJson(res, 200, { directory: mountedDir });
    return;
  }
  if (req.url === '/api/files' && req.method === 'GET') {
    try {
      sendJson(res, 200, { files: walk(mountedDir).sort() });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
    return;
  }
  if (req.url.startsWith('/api/file?') && req.method === 'GET') {
    const url = new URL(req.url, 'http://localhost');
    const full = filePath(url.searchParams.get('path'));
    if (!full) {
      sendJson(res, 400, { error: 'Invalid path' });
      return;
    }
    fs.readFile(full, 'utf8', (err, data) => {
      if (err) sendJson(res, 404, { error: err.message });
      else sendJson(res, 200, { content: data });
    });
    return;
  }
  if (req.url === '/api/mount' && req.method === 'POST') {
    readBody(req).then(body => {
      const next = path.resolve(JSON.parse(body).path);
      const stat = fs.statSync(next);
      if (!stat.isDirectory()) throw new Error('Path is not a directory');
      mountedDir = fs.realpathSync(next);
      sendJson(res, 200, { directory: mountedDir });
    }).catch(err => sendJson(res, 400, { error: err.message }));
    return;
  }
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/ide.html';
  const file = path.join(__dirname, p);
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server, path: '/terminal' });
wss.on('connection', ws => {
  const shell = process.platform === 'win32' ? 'powershell.exe' : (process.env.SHELL || '/bin/zsh');
  const term = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: mountedDir,
    env: { ...process.env },
  });
  term.onData(data => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify({ type: 'data', data }));
  });
  term.onExit(() => ws.close());
  ws.on('message', raw => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    if (msg.type === 'data') term.write(msg.data);
    else if (msg.type === 'resize') term.resize(msg.cols, msg.rows);
  });
  ws.on('close', () => term.kill());
});

server.listen(process.env.PORT, () => console.log(`http://localhost:${process.env.PORT}`));
