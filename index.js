const http = require('http');
const fs = require('fs');
const path = require('path');
const pty = require('node-pty');
const { WebSocketServer } = require('ws');

const serverRoot = process.cwd();
const modulesDir = path.join(serverRoot, 'modules');
let mountedDir = serverRoot;

const resolveModule = name => {
  const base = path.basename(name || '');
  if (base === path.basename(serverRoot)) return serverRoot;
  const candidate = path.join(modulesDir, base);
  if (candidate !== modulesDir && candidate.startsWith(modulesDir + path.sep)
    && fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    return fs.realpathSync(candidate);
  }
  return null;
};

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

const MODEL = 'claude-haiku-4-5';
const aiModule = import('ai');
const anthropicModule = import('@ai-sdk/anthropic');

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
  if (req.url === '/api/save' && req.method === 'POST') {
    readBody(req).then(body => {
      const { path: name, content } = JSON.parse(body);
      const full = filePath(name);
      if (!full) throw new Error('Invalid path');
      fs.writeFileSync(full, content, 'utf8');
      sendJson(res, 200, { ok: true });
    }).catch(err => sendJson(res, 400, { error: err.message }));
    return;
  }
  if (req.url === '/api/chat' && req.method === 'POST') {
    readBody(req).then(async body => {
      const { messages, system } = JSON.parse(body);
      const { streamText } = await aiModule;
      const { anthropic } = await anthropicModule;
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      const controller = new AbortController();
      let aborted = false;
      let streamed = '';
      const result = streamText({ model: anthropic(MODEL), messages, ...(system ? { system } : {}), abortSignal: controller.signal });
      res.on('close', () => { if (!res.writableFinished) { aborted = true; controller.abort(); } });
      try {
        for await (const delta of result.textStream) { streamed += delta; res.write(delta); }
      } catch (err) {
        if (!aborted) throw err;
      }
      res.end();
      if (aborted) {
        const usage = await result.usage.catch(() => null);
        const inputTokens = usage?.inputTokens ?? Math.ceil(JSON.stringify(messages).length / 3);
        const outputTokens = usage?.outputTokens ?? Math.ceil(streamed.length / 3);
        const cost = (inputTokens / 1e6) * 1 + (outputTokens / 1e6) * 5;
        console.log(`[cost][aborted] in=${inputTokens} out=${outputTokens} $${cost.toFixed(6)}`);
        return;
      }
      const usage = await result.usage;
      const cost = (usage.inputTokens / 1e6) * 1 + (usage.outputTokens / 1e6) * 5;
      console.log(`[cost] in=${usage.inputTokens} out=${usage.outputTokens} $${cost.toFixed(6)}`);
    }).catch(err => {
      if (!res.headersSent) sendJson(res, 500, { error: err.message });
      else res.end();
    });
    return;
  }
  if (req.url === '/api/mount' && req.method === 'POST') {
    readBody(req).then(body => {
      const next = resolveModule(JSON.parse(body).path);
      if (!next) throw new Error('Unknown module');
      mountedDir = next;
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
  const sessions = new Map();
  const send = msg => { if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg)); };
  const spawnSession = id => {
    const term = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: mountedDir,
      env: { ...process.env },
    });
    sessions.set(id, term);
    term.onData(data => send({ type: 'data', id, data }));
    term.onExit(() => { sessions.delete(id); send({ type: 'exit', id }); });
  };
  ws.on('message', raw => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    if (msg.type === 'spawn') spawnSession(msg.id);
    else if (msg.type === 'data') sessions.get(msg.id)?.write(msg.data);
    else if (msg.type === 'resize') sessions.get(msg.id)?.resize(msg.cols, msg.rows);
    else if (msg.type === 'kill') { sessions.get(msg.id)?.kill(); sessions.delete(msg.id); }
  });
  ws.on('close', () => { for (const term of sessions.values()) term.kill(); sessions.clear(); });
});

server.listen(process.env.PORT, () => console.log(`http://localhost:${process.env.PORT}`));
