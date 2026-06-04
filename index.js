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

const lcsDiff = (a, b) => {
  const m = a.length, n = b.length;
  const lcs = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const lines = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) { lines.push({ type: 'context', text: b[j] }); i++; j++; }
    else if (lcs[i + 1][j] >= lcs[i][j + 1]) { lines.push({ type: 'del', text: a[i] }); i++; }
    else { lines.push({ type: 'add', text: b[j] }); j++; }
  }
  while (i < m) { lines.push({ type: 'del', text: a[i] }); i++; }
  while (j < n) { lines.push({ type: 'add', text: b[j] }); j++; }
  return lines;
};

const gitDiff = (name, fallbackBefore, after) => {
  let base = fallbackBefore;
  try {
    execFileSync('git', ['-C', mountedDir, 'rev-parse', '--is-inside-work-tree'], { stdio: 'ignore' });
    base = execFileSync('git', ['-C', mountedDir, 'show', 'HEAD:' + name], { encoding: 'utf8' });
  } catch {
    base = fallbackBefore;
  }
  const a = base.replace(/\r\n?/g, '\n').split('\n');
  const b = after.replace(/\r\n?/g, '\n').split('\n');
  const lines = lcsDiff(a, b);
  const added = lines.filter(l => l.type === 'add').length;
  const removed = lines.filter(l => l.type === 'del').length;
  return { added, removed, lines };
};

const MODEL_PRICING = {
  'claude-opus-4-8':  { input: 5,    output: 25,   provider: 'anthropic' },
  'claude-sonnet-4-6': { input: 3,    output: 15,   provider: 'anthropic' },
  'claude-haiku-4-5':  { input: 1,    output: 5,    provider: 'anthropic' },
  'gpt-5.5':          { input: 5,    output: 30,   provider: 'openai' },
  'gpt-5.4':          { input: 2.5,  output: 15,   provider: 'openai' },
  'gpt-5.4-mini':     { input: 0.75, output: 4.5,  provider: 'openai' },
  'gpt-5.4-nano':     { input: 0.2,  output: 1.25, provider: 'openai' },
};
const DEFAULT_MODEL = 'claude-sonnet-4-6';
const aiModule = import('ai');
const anthropicModule = import('@ai-sdk/anthropic');
const openaiModule = import('@ai-sdk/openai');

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
      const { openai } = await openaiModule;
      const { z } = await import('zod');
      const languageModel = pricing.provider === 'openai' ? openai(model) : anthropic(model);
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      const controller = new AbortController();
      let aborted = false;
      let streamed = '';
      const writeEvent = event => res.write('\u0000' + JSON.stringify(event) + '\u0000');
      const streamingToolInputs = new Map();
      const toolNamesById = new Map();
      const tools = {
        
        'edit-file': tool({
          description: 'Edit a file in the workspace by applying every needed replacement in one call. Each replacement must be a match/replace pair, ordered as it should be applied. Returns one resulting diff.',
          inputSchema: z.object({
            path: z.string().describe('Path to the file relative to the workspace root.'),
            replacements: z.array(z.object({
              pattern: z.string().describe('A JavaScript regular expression matched against the current file contents.'),
              replacement: z.string().describe('The string that replaces this regex match.'),
            })).min(1).describe('All replacements for this file as ordered match/replace pairs. Do not split replacements for the same file across multiple tool calls.'),
          }),
          execute: async ({ path: name, replacements }) => {
            const full = filePath(name);
            if (!full) throw new Error('Invalid path');
            const before = fs.readFileSync(full, 'utf8');
            let after = before;
            for (const { pattern, replacement } of replacements) {
              after = after.replace(new RegExp(pattern), replacement);
            }
            fs.writeFileSync(full, after, 'utf8');
            const diff = gitDiff(name, before, after);
            return { path: name, ...diff };
          },
        }),
      };
      const result = streamText({ model: languageModel, messages, tools, stopWhen: stepCountIs(5), ...(system ? { system } : {}), abortSignal: controller.signal });
      res.on('close', () => { if (!res.writableFinished) { aborted = true; controller.abort(); } });
      try {
        for await (const part of result.fullStream) {
          if (part.type === 'text-delta') {
            const delta = part.text ?? part.delta ?? part.textDelta ?? '';
            streamed += delta;
            res.write(delta);
          } else if (part.type === 'tool-input-start') {
            const toolCallId = part.toolCallId ?? part.id;
            if (!toolCallId) continue;
            toolNamesById.set(toolCallId, part.toolName);
            streamingToolInputs.set(toolCallId, '');
            writeEvent({ kind: 'tool-call', toolCallId, toolName: part.toolName });
          } else if (part.type === 'tool-input-delta') {
            const toolCallId = part.toolCallId ?? part.id;
            if (!toolCallId) continue;
            const delta = part.inputTextDelta ?? part.delta ?? '';
            const inputText = (streamingToolInputs.get(toolCallId) || '') + delta;
            streamingToolInputs.set(toolCallId, inputText);
            writeEvent({ kind: 'tool-input-delta', toolCallId, toolName: toolNamesById.get(toolCallId), inputText, inputTextDelta: delta });
          } else if (part.type === 'tool-input-available') {
            const toolCallId = part.toolCallId ?? part.id;
            if (!toolCallId) continue;
            toolNamesById.set(toolCallId, part.toolName);
            writeEvent({ kind: 'tool-input', toolCallId, toolName: part.toolName, input: part.input });
          } else if (part.type === 'tool-call') {
            toolNamesById.set(part.toolCallId, part.toolName);
            writeEvent({ kind: 'tool-call', toolCallId: part.toolCallId, toolName: part.toolName, input: part.input });
          } else if (part.type === 'tool-result') {
            toolNamesById.set(part.toolCallId, part.toolName);
            writeEvent({ kind: 'tool-result', toolCallId: part.toolCallId, toolName: part.toolName, input: part.input, output: part.output });
          } else if (part.type === 'tool-output-available') {
            writeEvent({ kind: 'tool-result', toolCallId: part.toolCallId, toolName: toolNamesById.get(part.toolCallId), output: part.output });
          } else if (part.type === 'tool-error' || part.type === 'tool-output-error') {
            writeEvent({ kind: 'tool-error', toolCallId: part.toolCallId, toolName: part.toolName ?? toolNamesById.get(part.toolCallId), error: part.error ?? part.errorText });
          }
        }
      } catch (err) {
        if (!aborted) throw err;
      }
      res.end();
      if (aborted) {
        const usage = await result.totalUsage.catch(() => null);
        const inputTokens = usage?.inputTokens ?? Math.ceil(JSON.stringify(messages).length / 3);
        const outputTokens = usage?.outputTokens ?? Math.ceil(streamed.length / 3);
        const cost = (inputTokens / 1e6) * pricing.input + (outputTokens / 1e6) * pricing.output;
        console.log(`[cost][aborted] model=${model} in=${inputTokens} out=${outputTokens} $${cost.toFixed(6)}`);
        return;
      }
      const steps = await result.steps.catch(() => []);
      steps.forEach((step, i) => {
        const stepIn = step.usage?.inputTokens ?? 0;
        const stepOut = step.usage?.outputTokens ?? 0;
        const stepCost = (stepIn / 1e6) * pricing.input + (stepOut / 1e6) * pricing.output;
        console.log(`[cost][turn ${i + 1}/${steps.length}] model=${model} in=${stepIn} out=${stepOut} $${stepCost.toFixed(6)}`);
      });
      const usage = await result.totalUsage;
      const cost = (usage.inputTokens / 1e6) * pricing.input + (usage.outputTokens / 1e6) * pricing.output;
      console.log(`[cost][total] model=${model} in=${usage.inputTokens} out=${usage.outputTokens} $${cost.toFixed(6)}`);
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
