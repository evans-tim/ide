const http = require('http');
const fs = require('fs');
const path = require('path');
const pty = require('node-pty');
const { execFileSync } = require('child_process');
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

const gitStatus = () => {
  try {
    execFileSync('git', ['-C', mountedDir, 'rev-parse', '--is-inside-work-tree'], { stdio: 'ignore' });
  } catch {
    return { isRepo: false, status: {} };
  }
  let out;
  try {
    out = execFileSync('git', ['-C', mountedDir, 'status', '--porcelain', '-z', '--untracked-files=all'], { encoding: 'utf8' });
  } catch {
    return { isRepo: true, status: {} };
  }
  const status = {};
  const entries = out.split('\0');
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry) continue;
    const code = entry.slice(0, 2);
    let rel = entry.slice(3);
    if (code[0] === 'R' || code[0] === 'C') { i++; }
    if (!rel) continue;
    const index = code[0];
    const worktree = code[1];
    const staged = index !== ' ' && index !== '?';
    const isNew = code === '??' || index === 'A';
    if (staged) {
      status[rel] = isNew ? 'AS' : 'MS';
    } else {
      status[rel] = isNew ? 'U' : 'M';
    }
  }
  return { isRepo: true, status };
};

const MODEL_PRICING = {
  'claude-opus-4-8':  { input: 15,  output: 75  },
  'claude-sonnet-4-6': { input: 3,   output: 15  },
  'claude-haiku-4-5':  { input: 1,   output: 5   },
};
const DEFAULT_MODEL = 'claude-sonnet-4-6';
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
  if (req.url === '/api/git-status' && req.method === 'GET') {
    try {
      sendJson(res, 200, gitStatus());
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
    return;
  }
  if (req.url.startsWith('/api/git-head?') && req.method === 'GET') {
    const url = new URL(req.url, 'http://localhost');
    const name = url.searchParams.get('path');
    if (!filePath(name)) {
      sendJson(res, 400, { error: 'Invalid path' });
      return;
    }
    try {
      execFileSync('git', ['-C', mountedDir, 'rev-parse', '--is-inside-work-tree'], { stdio: 'ignore' });
    } catch {
      sendJson(res, 200, { isRepo: false, tracked: false, content: '' });
      return;
    }
    try {
      const content = execFileSync('git', ['-C', mountedDir, 'show', 'HEAD:' + name], { encoding: 'utf8' });
      sendJson(res, 200, { isRepo: true, tracked: true, content });
    } catch {
      sendJson(res, 200, { isRepo: true, tracked: false, content: '' });
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
      const { messages, system, model: requestedModel } = JSON.parse(body);
      const model = MODEL_PRICING[requestedModel] ? requestedModel : DEFAULT_MODEL;
      const pricing = MODEL_PRICING[model];
      const { streamText, tool, stepCountIs } = await aiModule;
      const { anthropic } = await anthropicModule;
      const { z } = await import('zod');
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      const controller = new AbortController();
      let aborted = false;
      let streamed = '';
      const writeEvent = event => res.write('\u0000' + JSON.stringify(event) + '\u0000');
      const tools = {
        'hello-world': tool({
          description: 'Returns a hello world greeting.',
          inputSchema: z.object({}),
          execute: async () => { await new Promise(resolve => setTimeout(resolve, 1000)); return { content: 'Hello, World!', elapsed: 1000 }; },
        }),
      };
      const result = streamText({ model: anthropic(model), messages, tools, stopWhen: stepCountIs(5), ...(system ? { system } : {}), abortSignal: controller.signal });
      res.on('close', () => { if (!res.writableFinished) { aborted = true; controller.abort(); } });
      try {
        for await (const part of result.fullStream) {
          if (part.type === 'text-delta') { const delta = part.text ?? part.textDelta ?? ''; streamed += delta; res.write(delta); }
          else if (part.type === 'tool-call') writeEvent({ kind: 'tool-call', toolCallId: part.toolCallId, toolName: part.toolName });
          else if (part.type === 'tool-result') writeEvent({ kind: 'tool-result', toolCallId: part.toolCallId, toolName: part.toolName, output: part.output });
        }
      } catch (err) {
        if (!aborted) throw err;
      }
      res.end();
      if (aborted) {
        const usage = await result.usage.catch(() => null);
        const inputTokens = usage?.inputTokens ?? Math.ceil(JSON.stringify(messages).length / 3);
        const outputTokens = usage?.outputTokens ?? Math.ceil(streamed.length / 3);
        const cost = (inputTokens / 1e6) * pricing.input + (outputTokens / 1e6) * pricing.output;
        console.log(`[cost][aborted] model=${model} in=${inputTokens} out=${outputTokens} $${cost.toFixed(6)}`);
        return;
      }
      const usage = await result.usage;
      const cost = (usage.inputTokens / 1e6) * pricing.input + (usage.outputTokens / 1e6) * pricing.output;
      console.log(`[cost] model=${model} in=${usage.inputTokens} out=${usage.outputTokens} $${cost.toFixed(6)}`);
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
