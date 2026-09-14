/**
 * Public data surface for the documentation tools.
 *
 * This used to be ~950 lines of hand-transcribed API data, which is how it went
 * 7 months stale and ended up teaching RE.Runtime.clock (removed from the
 * engine). It is now a thin merge layer over:
 *
 *   data/engine-api.json   generated from the engine's shipped .d.ts files
 *   src/curated/*          hand-written examples, gotchas, lifecycle
 *
 * Every export below is unchanged in name and shape, so index.ts and the format
 * functions keep working. Regenerate the data with:
 *   npm run extract -- --project <path-to-RogueEngine-project>
 */
import {
  ENGINE_CLASSES, BUILTIN_COMPONENTS, ENGINE_DECORATORS, ENGINE_META, metaFooter,
  type ClassInfo, type PropertyInfo, type MethodInfo, type DecoratorInfo,
} from './engine-api.js';
import { LIFECYCLE, type LifecycleMethod } from './curated/lifecycle.js';
import { GOTCHAS } from './curated/gotchas.js';

export type { ClassInfo, PropertyInfo, MethodInfo, DecoratorInfo, LifecycleMethod };
export { LIFECYCLE, ENGINE_META, metaFooter, BUILTIN_COMPONENTS };

/** Engine API classes, singletons and function groups. */
export const CLASS_INFO: Record<string, ClassInfo> = ENGINE_CLASSES;

/** All prop decorators, including the list.* / map.* forms. */
export const DECORATORS: DecoratorInfo[] = ENGINE_DECORATORS;

/** Every documented symbol name, for tool enums. Derived — never hand-listed. */
export const CLASS_NAMES: string[] = Object.keys(CLASS_INFO).sort();
export const COMPONENT_NAMES: string[] = Object.keys(BUILTIN_COMPONENTS).sort();

function groupClasses(): { name: string; classes: string[] }[] {
  const core: string[] = [], input: string[] = [], assets: string[] = [];
  const rendering: string[] = [], utils: string[] = [], fns: string[] = [];
  const RENDER = new Set(['Model', 'BVH', 'HitMesh', 'Skybox']);
  const ASSETS = new Set(['Prefab', 'AudioAsset', 'AssetManager']);
  const INPUT = new Set(['Input', 'Mouse', 'Keyboard', 'TouchController', 'GamepadController']);
  const UTILS = new Set(['Debug', 'Tags', 'Log', 'Error', 'Warning']);

  for (const [name, ci] of Object.entries(CLASS_INFO)) {
    if (ci.kind === 'functions') fns.push(name);
    else if (RENDER.has(name)) rendering.push(name);
    else if (ASSETS.has(name)) assets.push(name);
    else if (INPUT.has(name)) input.push(name);
    else if (UTILS.has(name)) utils.push(name);
    else core.push(name);
  }
  const byGroup: Record<string, string[]> = {};
  for (const [n, ci] of Object.entries(BUILTIN_COMPONENTS)) (byGroup[ci.group ?? 'Core'] ??= []).push(n);

  return [
    { name: 'Core', classes: core.sort() },
    { name: 'Input', classes: input.sort() },
    { name: 'Assets', classes: assets.sort() },
    { name: 'Rendering & Models', classes: rendering.sort() },
    { name: 'Utilities', classes: utils.sort() },
    { name: 'Functions & Events', classes: fns.sort() },
    ...Object.entries(byGroup).sort().map(([g, c]) => ({
      name: `Built-in Components: ${g}`, classes: c.sort(),
    })),
  ].filter(c => c.classes.length);
}

export const CATEGORIES = groupClasses();

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------
export interface SearchResult {
  className: string;
  section: string;
  content: string;
  relevance: number;
}

const MAX_RESULTS = 25; // was 10; with 36 components indexed that silently truncated

export function searchDocs(query: string): SearchResult[] {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(Boolean);
  const results: SearchResult[] = [];
  const hit = (hay: string) => hay.toLowerCase().includes(q);
  const anyWord = (hay: string) => words.some(w => hay.toLowerCase().includes(w));

  const scan = (bucket: Record<string, ClassInfo>, label: string) => {
    for (const [name, ci] of Object.entries(bucket)) {
      if (hit(name)) {
        results.push({ className: name, section: label, content: ci.description, relevance: 5 });
      } else if (hit(ci.description)) {
        results.push({ className: name, section: label, content: ci.description, relevance: 3 });
      }
      for (const p of [...ci.properties, ...(ci.staticProperties ?? [])]) {
        if (anyWord(`${p.name} ${p.description}`)) {
          results.push({
            className: name, section: 'Property',
            content: `${p.name}: ${p.type} — ${p.description}`, relevance: hit(p.name) ? 4 : 2,
          });
        }
      }
      for (const m of [...ci.methods, ...(ci.staticMethods ?? [])]) {
        if (anyWord(`${m.name} ${m.description}`)) {
          results.push({
            className: name, section: 'Method',
            content: `${m.signature} — ${m.description}`, relevance: hit(m.name) ? 4 : 2,
          });
        }
      }
    }
  };

  scan(CLASS_INFO, 'Class');
  scan(BUILTIN_COMPONENTS, 'Built-in Component');

  for (const d of DECORATORS) {
    if (anyWord(`${d.name} ${d.description}`)) {
      results.push({ className: 'Decorators', section: d.name, content: `${d.syntax} — ${d.description}`, relevance: 2 });
    }
  }
  for (const l of LIFECYCLE) {
    if (anyWord(`${l.name} ${l.description}`)) {
      results.push({ className: 'Lifecycle', section: l.name, content: l.description, relevance: 2 });
    }
  }
  for (const g of GOTCHAS) {
    if (anyWord(`${g.title} ${g.detail}`)) {
      results.push({ className: 'Gotcha', section: g.topic, content: g.title, relevance: 4 });
    }
  }

  return results.sort((a, b) => b.relevance - a.relevance).slice(0, MAX_RESULTS);
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------
function renderProps(title: string, list: PropertyInfo[]): string {
  if (!list.length) return '';
  let out = `\n## ${title}\n\n`;
  for (const p of list) {
    const flags = [p.readonly ? 'readonly' : '', p.deprecated ? 'DEPRECATED' : '']
      .filter(Boolean).join(', ');
    out += `- **${p.name}**: \`${p.type}\`${flags ? ` _(${flags})_` : ''}`;
    out += p.description ? ` — ${p.description}` : '';
    out += p.inheritedFrom ? ` _(from ${p.inheritedFrom})_` : '';
    out += '\n';
  }
  return out;
}

function renderMethods(title: string, list: MethodInfo[]): string {
  if (!list.length) return '';
  let out = `\n## ${title}\n\n`;
  for (const m of list) {
    out += `### ${m.name}${m.deprecated ? ' _(DEPRECATED)_' : ''}\n\n`;
    out += '```typescript\n' + (m.signatures?.length ? m.signatures.join('\n') : m.signature) + '\n```\n\n';
    if (m.description) out += `${m.description}\n\n`;
    if (m.inheritedFrom) out += `_Inherited from ${m.inheritedFrom}._\n\n`;
    if (m.example) out += '```typescript\n' + m.example + '\n```\n\n';
  }
  return out;
}

function formatEntry(ci: ClassInfo): string {
  let out = `# ${ci.name}\n\n${ci.description}\n`;
  if (ci.access) out += `\n**Access:** \`${ci.access}\`\n`;
  if (ci.baseClass) out += `\n**Extends:** \`${ci.baseClass}\`\n`;
  if (ci.group) out += `\n**Group:** ${ci.group}\n`;

  const own = ci.properties.filter(p => !p.inheritedFrom);
  const inherited = ci.properties.filter(p => p.inheritedFrom);
  out += renderProps('Properties', own);
  out += renderProps('Inherited Properties', inherited);
  out += renderProps('Static Properties', ci.staticProperties ?? []);
  out += renderMethods('Methods', ci.methods);
  out += renderMethods('Static Methods', ci.staticMethods ?? []);
  if (ci.example) out += `\n## Example\n\n\`\`\`typescript\n${ci.example}\n\`\`\`\n`;
  return out + metaFooter();
}

/** Nearest-name suggestion for clients that ignore enums. */
function suggest(name: string, pool: string[]): string {
  const n = name.toLowerCase();
  const near = pool.filter(c => c.toLowerCase().includes(n) || n.includes(c.toLowerCase()));
  return near.length ? ` Did you mean: ${near.slice(0, 5).join(', ')}?` : '';
}

export function formatClassInfo(className: string): string {
  const ci = CLASS_INFO[className] ?? BUILTIN_COMPONENTS[className];
  if (!ci) {
    return `Class '${className}' not found.` +
      suggest(className, [...CLASS_NAMES, ...COMPONENT_NAMES]) +
      `\n\nUse list_re_categories to see everything available.`;
  }
  return formatEntry(ci);
}

export function formatComponentInfo(name: string): string {
  const ci = BUILTIN_COMPONENTS[name];
  if (!ci) {
    return `Built-in component '${name}' not found.` + suggest(name, COMPONENT_NAMES) +
      `\n\nUse list_builtin_components to see all ${COMPONENT_NAMES.length}.`;
  }
  return formatEntry(ci);
}

export function formatComponentList(group?: string, search?: string): string {
  let entries = Object.values(BUILTIN_COMPONENTS);
  if (group) entries = entries.filter(c => (c.group ?? 'Core').toLowerCase() === group.toLowerCase());
  if (search) {
    const s = search.toLowerCase();
    entries = entries.filter(c => c.name.toLowerCase().includes(s) || c.description.toLowerCase().includes(s));
  }
  if (!entries.length) {
    return `No built-in components matched.` +
      ` Groups: ${[...new Set(Object.values(BUILTIN_COMPONENTS).map(c => c.group ?? 'Core'))].sort().join(', ')}`;
  }
  const byGroup: Record<string, ClassInfo[]> = {};
  for (const c of entries) (byGroup[c.group ?? 'Core'] ??= []).push(c);

  let out = `# Built-in Components (${entries.length})\n\n` +
    `Attach these in the editor, or via code. Use \`get_builtin_component\` for full detail.\n`;
  for (const [g, list] of Object.entries(byGroup).sort()) {
    out += `\n## ${g}\n\n`;
    for (const c of list.sort((a, b) => a.name.localeCompare(b.name))) {
      const first = (c.description || '').split('. ')[0];
      out += `- **${c.name}**${c.baseClass ? ` _(extends ${c.baseClass})_` : ''} — ${first || 'No description.'}\n`;
    }
  }
  return out + metaFooter();
}

export function formatDecorators(): string {
  let out = `# RogueEngine Property Decorators (${DECORATORS.length})\n\n` +
    `Declare inspector-editable props on a component.\n\n`;
  const base = DECORATORS.filter(d => !d.name.includes('.'));
  const listMap = DECORATORS.filter(d => d.name.includes('.'));

  for (const d of base) {
    out += `## ${d.syntax}\n\n`;
    if (d.propertyType) out += `**Property type:** \`${d.propertyType}\`\n\n`;
    out += `${d.description}\n\n`;
    if (d.example) out += '```typescript\n' + d.example + '\n```\n\n';
    out += '---\n\n';
  }
  if (listMap.length) {
    out += `## List and Map forms\n\n` +
      `Every decorator above also works as a list or a key/value map:\n\n` +
      '```typescript\n' +
      '@RE.props.list.object3d() targets: THREE.Object3D[] = [];\n' +
      '@RE.props.map.num() values: Record<string, number> = {};\n' +
      '```\n\n' +
      `Available: ${listMap.map(d => `\`${d.name}\``).join(', ')}\n`;
  }
  return out + metaFooter();
}

export function formatLifecycle(): string {
  let out = `# Component Lifecycle\n\n` +
    `\`awake()\` → \`start()\` → [\`beforeUpdate()\` → \`update()\` → \`afterUpdate()\`] (loop) → \`onBeforeRemoved()\`\n\n`;
  for (const l of LIFECYCLE) {
    out += `## ${l.name}\n\n${l.description}\n\n**When:** ${l.whenCalled}\n\n`;
    if (l.example) out += '```typescript\n' + l.example + '\n```\n\n';
  }
  return out;
}

export function formatCategories(): string {
  let out = `# RogueEngine API Categories\n\n`;
  for (const c of CATEGORIES) {
    out += `## ${c.name} (${c.classes.length})\n\n`;
    for (const cls of c.classes) out += `- ${cls}\n`;
    out += '\n';
  }
  return out + metaFooter();
}

export function formatSearchResults(results: SearchResult[]): string {
  if (!results.length) {
    return 'No results found. Try a class name (Character, Model), a member (applyDamage), ' +
      'or a concept (raycast, audio, shadow).';
  }
  let out = `# Search Results (${results.length})\n\n`;
  for (const r of results) out += `## ${r.className} — ${r.section}\n\n${r.content}\n\n`;
  return out;
}
