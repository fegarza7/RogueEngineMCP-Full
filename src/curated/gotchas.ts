/**
 * Hand-written RogueEngine foot-guns: things that compile, look right, and are
 * wrong. Not derivable from a .d.ts, so they live here permanently.
 *
 * Scope is deliberately GENERAL-PURPOSE RogueEngine knowledge — true for any
 * project. Project-specific conventions do not belong in this repo.
 */

export interface Gotcha {
  id: string;
  topic: 'assets' | 'performance' | 'raycasting' | 'models' | 'audio' | 'lifecycle' | 'api' | 'batching';
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
    id: 'loaded-models-metalness-zero',
    topic: 'models',
    title: 'Loaded models have metalness forced to 0 — metallic parts look matte',
    detail:
      'The engine\'s model loader sets metalness = 0 on every material of every .glb and .fbx it ' +
      'loads (AssetManager.removeMetalness), so armor, weapons and other metal authored in the ' +
      'file render like plastic. Restore it in code after loading. Materials are shared by every ' +
      'copy of a model, so set it once per model, not per instance. (FBX files are also scaled ' +
      'by 0.01 on load.)',
    right: `const model = await RE.Model.fetch(name);
model?.source?.traverse(o => {
  if ((o as THREE.Mesh).isMesh) {
    const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial;
    if ("metalness" in m) m.metalness = 1; // or the value authored in the file
  }
});`,
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

  // ── Batching (1.3.0) ──────────────────────────────────────────────────────
  {
    id: 'batching-second-add-hides-mesh',
    topic: 'batching',
    title: 'Adding a batched mesh to the scene a second time hides it for good',
    detail:
      'RE patches Object3D.add() and attach(), so every add hands the object to the batcher. ' +
      'Once a batch exists for a mesh\'s geometry + material, the first add takes the mesh into ' +
      'it: the batcher replaces `visible` with a getter that always returns false (the batch ' +
      'draws it instead) and records that the game wants it shown. Add the SAME mesh again — ' +
      're-parenting it, or re-adding it to its own parent — and the batcher records ' +
      '`mesh.visible !== false`, which is now its own getter, so it records "hidden" and gives ' +
      'the mesh a second slot. The mesh then never draws, but it can still be clicked, because ' +
      'three\'s Raycaster tests layers, not visible. It only starts once a batch of that mesh ' +
      'exists, so it tends to appear on the 3rd or 4th copy and looks random. ' +
      'Batching.clear() or rebuild() brings the meshes back until the next re-add. ' +
      'Build each copy off-scene and add it once, into the parent it will live under.',
    wrong: `const copy = await RE.Model.instantiate(name); // no parent: added to the scene
parent.add(copy);                              // second add: hidden once batched`,
    right: `const stage = new THREE.Group();                      // never added to the scene
const copy = await RE.Model.instantiate(name, stage); // the batcher ignores it here
parent.add(copy);                                     // the only add`,
  },
  {
    id: 'instantiate-attaches-to-scene',
    topic: 'models',
    title: 'instantiate() with no parent adds the copy to the scene; with a parent it keeps world transform',
    detail:
      'RE.Model.instantiate(name) and prefab.instantiate() with no parent call ' +
      'App.currentScene.attach(copy): the copy is already in the scene when you get it, so ' +
      'adding it to your own object afterwards is a second add (see the batching gotcha). ' +
      'Passing the parent directly is not a drop-in fix: instantiate() uses attach(), which ' +
      'keeps the copy\'s WORLD transform, so under a parent that is not at the origin the copy ' +
      'stays at the world origin. Instantiate into a detached group, then add() it to the real ' +
      'parent: add() keeps the local transform. The static RE.Prefab.instantiate(name) takes ' +
      'no parent; use (await RE.Prefab.fetch(name)).instantiate(parent) for that.',
    wrong: `// the copy stays at the world origin, not at parent's position
const copy = await RE.Model.instantiate(name, parent);`,
    right: `const copy = await RE.Model.instantiate(name, new THREE.Group());
parent.add(copy); // local transform kept, one add`,
  },
  {
    id: 'remove-destroys-components',
    topic: 'lifecycle',
    title: 'Object3D.remove() destroys the removed subtree\'s components',
    detail:
      'RE patches remove(): unless the object is being moved by an add()/attach() call, ' +
      'removing it from its parent removes every component on it and its children. ' +
      'Re-adding it later does not bring them back. To move an object, call newParent.add(obj) ' +
      'directly — that detaches it from the old parent without the teardown — rather than ' +
      'remove() followed by add(). If the object has batched meshes, that move is itself a ' +
      'second add and hides them (see the batching gotchas): keep objects you move between ' +
      'parents out of batching.',
    wrong: `oldParent.remove(obj);   // components on obj are gone
newParent.add(obj);`,
    right: `newParent.add(obj);      // moves it, components intact`,
  },
  {
    id: 'batching-exclude-and-schedule',
    topic: 'batching',
    title: 'Keep moving or temporary objects out of batching with your own schedule()',
    detail:
      'At scene start the engine schedules its own build of the whole scene, with no exclude, ' +
      'right after components\' start(). A schedule() you issue in start() is overwritten; ' +
      'issue it on the next frame (RE.onNextFrame) and every later automatic rebuild keeps your ' +
      'exclude. The exclude predicate is asked about each object the batcher visits: during a ' +
      'build it prunes whole subtrees, but when an object is added it is asked only about that ' +
      'object and its descendants, NOT its ancestors — a mesh added directly under an excluded ' +
      'parent slips through unless the predicate walks up the parents. Good candidates to ' +
      'exclude: things that move every frame, placement previews, hidden holding groups, and ' +
      'effects built from several meshes that share one geometry and material.',
    right: `const exclude = (o: THREE.Object3D) => {
  for (let n: THREE.Object3D | null = o; n; n = n.parent) if (n.userData.noBatch) return true;
  return false;
};
RE.onNextFrame(() => RE.Batching.schedule({
  root: RE.Runtime.scene, parent: RE.Runtime.scene, mode: "auto", exclude,
}));`,
  },
  {
    id: 'batching-rebuild-limit',
    topic: 'batching',
    title: 'Automatic rebuilds stop after 8 per schedule() — then material swaps stop showing',
    detail:
      'When a batched mesh\'s material, geometry or render flags change, the batcher marks it ' +
      'out of date and rebuilds. It also rebuilds when 4 added meshes of one kind find no batch, ' +
      'or 8 new meshes appear. All of these share a limit of 8 rebuilds per schedule() (the ' +
      'rebuildBudget option of schedule()). After ' +
      'that an out-of-date mesh stays hidden while its batch slot keeps drawing the OLD material ' +
      '— e.g. dimming or highlighting by swapping materials quietly stops working. ' +
      'schedule() resets the count and builds once the scene stops changing: call it after ' +
      'bulk changes such as a level switch or a batch of material swaps.',
  },
  {
    id: 'batching-misreadings',
    topic: 'batching',
    title: 'On a batched mesh, visible always reads false — and three other easy misreadings',
    detail:
      '(1) While the batcher owns a mesh, `mesh.visible` is a getter returning false; writes go ' +
      'to the batcher\'s record, and that path works. Read what the game asked for with ' +
      'RE.Batching.userVisible(mesh), and whether it reaches the screen with ' +
      'RE.Batching.isDrawn(mesh). ' +
      '(2) state().drawn counts owned meshes listed in a batch; it does not mean they render. ' +
      '(3) repair() only restores meshes the batcher no longer owns. It cannot fix a mesh it ' +
      'still owns but has recorded as hidden. ' +
      '(4) setStatic(obj, true) means "transforms trusted, never synced": moving such an object ' +
      'leaves its batch instance behind. Only use it for things that truly never move.',
  },
  {
    id: 'raycast-hits-batch',
    topic: 'raycasting',
    title: 'A raycast hit can be the batch, not your mesh — resolve it before walking up',
    detail:
      'With batching, the source mesh stays in the scene (hidden but still raycastable) and the ' +
      'batch is a real InstancedMesh at the same place, so a hit can report either. Walking up ' +
      'hit.object\'s parents from the batch finds none of your objects. Resolve the hit first; ' +
      'code that only reads hit.point is unaffected.',
    wrong: `let node = hits[0].object;
while (node && !node.userData.id) node = node.parent;`,
    right: `let node = RE.Batching.sourceOfHit(hits[0]) ?? hits[0].object;
while (node && !node.userData.id) node = node.parent;`,
  },

  // ── Loading screen (1.3.0) ────────────────────────────────────────────────
  {
    id: 'loading-screen-set-at-top-level',
    topic: 'lifecycle',
    title: 'RE.LoadingScreen.set() at the top of a script also replaces the EDITOR\'s loading screen',
    detail:
      'The editor loads your scripts too, and RE.LoadingScreen is one screen for the whole page. ' +
      'Code at the top level of a file runs as soon as it loads — inside the editor as well — so ' +
      'set() there makes the editor load its own scenes through your screen. If your hide() also ' +
      'waits for your game to finish booting, the editor stays covered forever. Register your ' +
      'screen from a component instead (awake() only runs when the game runs), give the editor ' +
      'its screen back on stop, and let hide() always hide. To cover the very first scene load ' +
      'in a build, use the custom build page (it only exists in builds): it can pass its own ' +
      'splash to set() before the scene starts.',
    wrong: `// top level of a script: also runs in the editor
RE.LoadingScreen.set(myScreen);`,
    right: `awake() {
  RE.LoadingScreen.set(myScreen);
  RE.LoadingScreen.show();
  const s = RE.Runtime.onStop(() => { RE.LoadingScreen.set(); s.stop(); });
}`,
  },
  {
    id: 'onplay-before-models-load',
    topic: 'lifecycle',
    title: 'Runtime.onPlay fires before the scene\'s models load',
    detail:
      'play() fires onPlay first, then builds the scene\'s model stubs, then starts the scene ' +
      '(hides the loading screen, then runs components\' awake()/start()). Hiding a page splash ' +
      'on onPlay therefore leaves the engine\'s own loading screen showing in between. Also, in ' +
      'a build the first scene load starts while build.js is still running, so ' +
      'LoadingScreen.show() is called before the page\'s onload handler runs. A splash set from ' +
      'onload misses that first show(), and if the scene has no model stubs the engine shows no ' +
      'screen during play() at all — have your own screen hide the page splash when it takes over.',
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
