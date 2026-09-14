/**
 * Hand-written RogueEngine foot-guns: things that compile, look right, and are
 * wrong. Not derivable from a .d.ts, so they live here permanently.
 *
 * Scope is deliberately GENERAL-PURPOSE RogueEngine knowledge — true for any
 * project. Project-specific conventions do not belong in this repo.
 */

export interface Gotcha {
  id: string;
  topic: 'assets' | 'performance' | 'raycasting' | 'models' | 'audio' | 'lifecycle' | 'api';
  title: string;
  detail: string;
  wrong?: string;
  right?: string;
}

export const GOTCHAS: Gotcha[] = [
  {
    id: 'set-asset-path-singular-vs-plural',
    topic: 'assets',
    title: 'setAssetPath() is additive; setAssetPaths() destroys the entire registry',
    detail:
      'The two names differ by one character and do opposite things. setAssetPath(uuid, path) ' +
      'merges a single entry. setAssetPaths(map) REPLACES the whole map — its own doc says ' +
      '"Replaces the entire asset-paths map". Calling the plural one to add a path after boot ' +
      'silently unregisters every asset the build registered, and failures surface later as ' +
      'unrelated missing-asset errors.',
    wrong: `// wipes every path the build registered
RE.AssetManager.setAssetPaths({ [uuid]: url });`,
    right: `// merges one entry, leaves the rest intact
RE.AssetManager.setAssetPath(uuid, url);`,
  },
  {
    id: 'remote-asset-loading',
    topic: 'assets',
    title: 'Assets can be served from a CDN via window.re_prefix, and registered at runtime',
    detail:
      'getAssetPath(uuid) is the single funnel for every uuid-keyed asset fetch (prefabs, ' +
      'models, materials, textures, scenes) and it prefixes with window.re_prefix when set. ' +
      'Because Model.namedModelUUIDs / Prefab.namedPrefabUUIDs are plain public objects, you ' +
      'can also register assets the build never knew about — as long as you do it AFTER ' +
      'App.play(), which assigns both registries wholesale at boot and would overwrite ' +
      'anything written earlier.',
    right: `// after App.play(), e.g. from a boot component
RE.Model.namedModelUUIDs[name] = uuid;
RE.AssetManager.setAssetPath(uuid, "https://cdn.example.com/" + file);
const obj = await RE.Model.instantiate(name);`,
  },
  {
    id: 'point-lights-cost',
    topic: 'performance',
    title: 'Point lights cost 6+ draw calls; use a wide spotlight instead',
    detail:
      'A shadow-casting point light renders its shadow map as a cubemap — at least six draw ' +
      'calls. A spotlight is a single frustum: one draw. For torches, lamps and braziers, open ' +
      'a spotlight cone wide instead. Light environments with SpotLight + HemisphereLight + ' +
      'DirectionalLight.',
  },
  {
    id: 'bvh-excludes-skinned',
    topic: 'raycasting',
    title: 'BVH raycast acceleration skips skinned meshes — use HitMesh for posed characters',
    detail:
      'RE accelerates Mesh.raycast with a bounding volume hierarchy automatically, but skinned ' +
      'meshes and morph targets are excluded because they have their own pose handling. ' +
      'Raycasting an animated character therefore stays slow AND can report hits off the ' +
      'current pose. HitMesh generates per-bone hit pieces that follow the animation and each ' +
      'carry their own BVH. Opt a mesh out of BVH entirely with userData.bvh = false.',
  },
  {
    id: 'model-stubs-need-sources',
    topic: 'models',
    title: 'Scenes and prefabs store model STUBS — keep the source .glb/.fbx',
    detail:
      'Since 1.1, a scene or prefab containing a 3D model stores a lightweight stub referencing ' +
      'the source file rather than inlining the geometry. This is what keeps those files small, ' +
      'but it means the original model must remain in the project or the stub cannot rehydrate. ' +
      'Deleting or moving a source .glb/.fbx breaks every scene and prefab that references it.',
  },
  {
    id: 'audioasset-not-playable',
    topic: 'audio',
    title: 'AudioAsset has no play() — get the THREE.Audio, or use the AudioPlayer component',
    detail:
      'RE.AudioAsset exposes getAudio() and getPositionalAudio(); it has no play()/stop() of its ' +
      'own. Calling audioAsset.play() does not compile. Either drive the returned THREE.Audio, ' +
      'or use the built-in AudioPlayer / AudioPlayer3D components and route them through ' +
      'AudioMixer buses.',
    wrong: `@RE.props.audio() music: RE.AudioAsset;
this.music.play();            // AudioAsset has no play()`,
    right: `@RE.props.audio() music: RE.AudioAsset;
this.music.getAudio().play(); // or use an AudioPlayer component`,
  },
  {
    id: 'runtime-clock-removed',
    topic: 'api',
    title: 'RE.Runtime.clock was removed — use RE.Runtime.timer.getElapsed()',
    detail:
      'three.js moved away from Clock, so RE replaced Runtime.clock with a THREE.Timer exposed ' +
      'as Runtime.timer (inherited from SceneController). Note the method name also changed: ' +
      'Timer uses getElapsed(), not Clock’s getElapsedTime(). Per-frame delta is still ' +
      'RE.Runtime.deltaTime.',
    wrong: `const t = RE.Runtime.clock.getElapsedTime();`,
    right: `const t = RE.Runtime.timer.getElapsed();`,
  },
  {
    id: 'input-getaxes-not-getaxis',
    topic: 'api',
    title: 'The axis API is getAxes() and returns {x, y} — there is no getAxis()',
    detail:
      'RE.Input.getAxes(name, player?) returns a Vector2-like {x, y} for an axes-based action. ' +
      'There is no singular getAxis(). Buttons use getDown()/getPressed()/getUp().',
    wrong: `const h = RE.Input.getAxis("Horizontal");
const v = RE.Input.getAxis("Vertical");`,
    right: `const { x, y } = RE.Input.getAxes("Move");`,
  },
  {
    id: 'select-options-convention',
    topic: 'api',
    title: 'props.select() needs a sibling {propertyName}Options INSTANCE property',
    detail:
      'The dropdown reads its options from an instance property named exactly ' +
      '{propertyName}Options. A static property will not work. Options are either strings or ' +
      '{name, value} objects.',
    wrong: `@RE.props.select() mode = 0;
static modeOptions = ["Easy", "Hard"];   // static does NOT work`,
    right: `@RE.props.select() mode = 0;
modeOptions = ["Easy", "Hard"];`,
  },
  {
    id: 'lifecycle-isready',
    topic: 'lifecycle',
    title: 'Use awake() for lookups, start() for anything touching assets',
    detail:
      'awake() runs as soon as the component is activated — asset-backed props may not be ' +
      'loaded yet. isReady becomes true once every asset referenced by the component interface ' +
      'has loaded, and start() only runs after that. Instantiating a prefab or reading a ' +
      'texture in awake() is the usual cause of intermittent null-asset bugs.',
  },
];

export function formatGotchas(topic?: string): string {
  const list = topic ? GOTCHAS.filter(g => g.topic === topic) : GOTCHAS;
  if (!list.length) {
    return `No gotchas for topic "${topic}". Known topics: ` +
      [...new Set(GOTCHAS.map(g => g.topic))].join(', ');
  }
  let out = `# RogueEngine Gotchas${topic ? ` — ${topic}` : ''}\n\n`;
  for (const g of list) {
    out += `## ${g.title}\n\n_${g.topic}_\n\n${g.detail}\n\n`;
    if (g.wrong) out += `**Wrong:**\n\`\`\`typescript\n${g.wrong}\n\`\`\`\n\n`;
    if (g.right) out += `**Right:**\n\`\`\`typescript\n${g.right}\n\`\`\`\n\n`;
    out += '---\n\n';
  }
  return out;
}
