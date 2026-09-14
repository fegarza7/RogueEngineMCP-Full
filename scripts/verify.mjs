#!/usr/bin/env node
/**
 * Two safety nets, run together via `npm run verify`:
 *
 *  1. Curated staleness — every `RE.Something.member` written in a hand-written
 *     example is checked against the generated API. This is the mechanism that
 *     would have caught RE.Runtime.clock years before a human did. Comment lines
 *     are skipped, so an example may deliberately NAME a removed API while
 *     teaching the replacement.
 *
 *  2. Server smoke — boots dist/index.js over stdio, lists tools, calls every
 *     zero-arg doc tool plus a sample of class lookups, asserts none error, and
 *     greps every response for known-removed APIs.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { spawn } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
const fail = (m) => { console.error(`  FAIL  ${m}`); failures++; };
const ok = (m) => console.log(`  ok    ${m}`);

// ---------------------------------------------------------------------------
// 1. Curated staleness
// ---------------------------------------------------------------------------
console.log('\n[1/2] curated examples vs generated API');

const apiPath = path.join(ROOT, 'data', 'engine-api.json');
if (!existsSync(apiPath)) {
  console.error('  data/engine-api.json missing — run: npm run extract -- --project <path>');
  process.exit(1);
}
const api = JSON.parse(readFileSync(apiPath, 'utf8'));

const topLevel = new Set([
  ...Object.keys(api.classes), ...Object.keys(api.components),
  ...Object.keys(api.functionGroups), ...api.types.map(t => t.name),
]);
// members of every bucket, as "Class.member"
const members = new Set();
for (const bucket of ['classes', 'components', 'functionGroups']) {
  for (const [cn, ci] of Object.entries(api[bucket] ?? {})) {
    for (const k of ['properties', 'methods', 'staticProperties', 'staticMethods']) {
      for (const m of ci[k] ?? []) members.add(`${cn}.${m.name}`);
    }
  }
}
// functions are reached as RE.foo(), not RE.Functions.foo()
for (const ci of Object.values(api.functionGroups ?? {})) {
  for (const m of ci.methods ?? []) topLevel.add(m.name);
}
for (const d of api.decorators ?? []) topLevel.add(`props.${d.name}`);

const curatedDir = path.join(ROOT, 'src', 'curated');
const stripComments = (line) => line.replace(/\\n\s*\/\/[^"\\]*/g, ' ').replace(/\/\/.*$/, '');

let checked = 0;
for (const f of readdirSync(curatedDir).filter(f => f.endsWith('.ts'))) {
  const text = readFileSync(path.join(curatedDir, f), 'utf8');
  // gotchas.ts is prose ABOUT broken APIs: its title/detail/wrong fields name
  // removed APIs on purpose. Only its `right:` samples assert correct usage,
  // so those are the only lines worth validating in that file.
  const onlyRight = f === "gotchas.ts";
  let inRight = false;
  for (const rawLine of text.split('\n')) {
    if (onlyRight) {
      if (/^\s*right:/.test(rawLine)) inRight = true;
      else if (/^\s*(id|topic|title|detail|wrong):/.test(rawLine)) inRight = false;
      if (!inRight) continue;
    }
    const line = stripComments(rawLine);
    for (const m of line.matchAll(/\bRE\.([A-Za-z_$][\w$]*)(?:\.([A-Za-z_$][\w$]*))?/g)) {
      const [, cls, member] = m;
      checked++;
      if (cls === 'props') continue;               // decorator forms vary
      if (!topLevel.has(cls)) { fail(`${f}: RE.${cls} is not in the generated API`); continue; }
      if (member && members.size && topLevel.has(cls)) {
        const key = `${cls}.${member}`;
        // only flag when we actually have members for that class
        const hasAny = [...members].some(k => k.startsWith(`${cls}.`));
        if (hasAny && !members.has(key)) fail(`${f}: RE.${key} does not exist on ${cls}`);
      }
    }
  }
}
if (!failures) ok(`${checked} RE.* references in curated examples all resolve`);

// orphaned curated keys
const curatedSrc = readFileSync(path.join(curatedDir, 'examples.ts'), 'utf8');
const memberBlock = curatedSrc.split('MEMBER_EXAMPLES')[1] ?? '';
for (const m of memberBlock.matchAll(/"([A-Z]\w+)\.(\w+)":/g)) {
  const key = `${m[1]}.${m[2]}`;
  if (!members.has(key)) fail(`orphaned curated example for ${key} (member no longer exists)`);
}
if (!failures) ok('no orphaned curated example keys');

// ---------------------------------------------------------------------------
// 2. Server smoke
// ---------------------------------------------------------------------------
console.log('\n[2/2] server smoke');

const BANNED = [
  { re: /Runtime\.clock/, why: 'RE.Runtime.clock was removed' },
  { re: /getElapsedTime\(\)/, why: 'Clock.getElapsedTime() -> Timer.getElapsed()' },
  { re: /Input\.getAxis\(/, why: 'getAxis() does not exist; it is getAxes()' },
];

function rpc(requests) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(ROOT, 'dist', 'index.js')], {
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    let out = '';
    child.stdout.on('data', c => { out += c; });
    child.on('error', reject);
    child.on('close', () => {
      resolve(out.trim().split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean));
    });
    for (const r of requests) child.stdin.write(JSON.stringify(r) + '\n');
    child.stdin.end();
    setTimeout(() => child.kill(), 30000);
  });
}

const listRes = await rpc([{ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }]);
const tools = listRes[0]?.result?.tools ?? [];
if (!tools.length) fail('tools/list returned nothing');
else ok(`tools/list returned ${tools.length} tools`);

const calls = [];
let id = 10;
const zeroArg = ['get_re_decorators', 'get_re_lifecycle', 'list_re_categories'];
for (const name of zeroArg) {
  if (tools.some(t => t.name === name)) calls.push({ jsonrpc: '2.0', id: id++, method: 'tools/call', params: { name, arguments: {} } });
}
for (const cn of ['Runtime', 'Model', 'Component', 'Prefab', 'Input', 'Tags', 'App']) {
  calls.push({ jsonrpc: '2.0', id: id++, method: 'tools/call', params: { name: 'get_re_class_info', arguments: { className: cn } } });
}
for (const q of ['hp', 'raycast', 'audio']) {
  calls.push({ jsonrpc: '2.0', id: id++, method: 'tools/call', params: { name: 'search_re_docs', arguments: { query: q } } });
}
if (tools.some(t => t.name === 'get_builtin_component')) {
  for (const n of ['Character', 'UIButton', 'AudioPlayer']) {
    calls.push({ jsonrpc: '2.0', id: id++, method: 'tools/call', params: { name: 'get_builtin_component', arguments: { name: n } } });
  }
}
if (tools.some(t => t.name === 'list_builtin_components')) {
  calls.push({ jsonrpc: '2.0', id: id++, method: 'tools/call', params: { name: 'list_builtin_components', arguments: {} } });
}
if (tools.some(t => t.name === 'get_re_gotchas')) {
  calls.push({ jsonrpc: '2.0', id: id++, method: 'tools/call', params: { name: 'get_re_gotchas', arguments: {} } });
}

const results = await rpc(calls);
let empties = 0;
for (const r of results) {
  const text = r.result?.content?.[0]?.text ?? '';
  if (r.result?.isError) { fail(`tool call ${r.id} returned isError`); continue; }
  if (text.trim().length < 20) { empties++; continue; }
  for (const b of BANNED) {
    // allow a deliberate teaching mention inside a comment line
    const offending = text.split('\n').filter(l => b.re.test(l) && !l.trim().startsWith('//') && !l.includes('REMOVED'));
    if (offending.length) fail(`response ${r.id} contains banned API (${b.why}): ${offending[0].trim().slice(0, 80)}`);
  }
}
if (results.length !== calls.length) fail(`expected ${calls.length} responses, got ${results.length}`);
else ok(`${results.length} tool calls responded`);
if (empties) fail(`${empties} responses were empty`);
else if (results.length) ok('no empty responses');

console.log(failures ? `\nFAILED (${failures})` : '\nAll checks passed.');
process.exit(failures ? 1 : 0);
