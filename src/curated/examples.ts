/**
 * Hand-written teaching examples and description overrides.
 *
 * THIS FILE IS NEVER TOUCHED BY THE EXTRACTOR. Generated data supplies the
 * accurate API surface; this supplies the pedagogy the .d.ts cannot.
 *
 * Where a JSDoc description is wrong or imprecise, override it here --
 * e.g. props.select(), whose JSDoc claims options come from a
 * "selectedOptions getter" when the real convention is {propertyName}Options.
 *
 * Migrated from the pre-generation docs-data.ts so nothing was lost.
 */

/** Class-level usage examples, keyed by class name. */
export const CLASS_EXAMPLES: Record<string, string> = {
  "Component": "import * as RE from 'rogue-engine';\n\nexport default class MyComponent extends RE.Component {\n  awake() { }\n  start() { }\n  update() { }\n  onBeforeRemoved() { }\n}\n\nRE.registerComponent(MyComponent);",
  "Keyboard": "Common key codes:\n- \"KeyW\", \"KeyA\", \"KeyS\", \"KeyD\" - WASD\n- \"ArrowUp\", \"ArrowDown\", \"ArrowLeft\", \"ArrowRight\" - Arrows\n- \"Space\", \"Enter\", \"Escape\", \"Tab\"\n- \"ShiftLeft\", \"ShiftRight\", \"ControlLeft\", \"ControlRight\"\n- \"Digit0\" - \"Digit9\" - Number keys\n- \"F1\" - \"F12\" - Function keys",
  "GamepadController": "Standard button mapping:\n0=A/Cross, 1=B/Circle, 2=X/Square, 3=Y/Triangle\n4=LB, 5=RB, 6=LT, 7=RT\n8=Select, 9=Start\n10=Left Stick, 11=Right Stick\n12-15=D-Pad (Up, Down, Left, Right)",
  "Runtime": "// Frame-independent movement\nthis.object3d.position.x += this.speed * RE.Runtime.deltaTime;\n\n// Total elapsed time.\n// NOTE: Runtime.clock was REMOVED (three.js dropped Clock).\n// It is now a THREE.Timer, and the method is getElapsed() -- not getElapsedTime().\nconst elapsed = RE.Runtime.timer.getElapsed();",
  "AudioAsset": "@RE.props.audio()\nshootSound: RE.AudioAsset;\n\nfire() {\n  // AudioAsset itself has no play(); get the THREE.Audio from it.\n  this.shootSound?.getAudio().play();\n}\n\n// For anything more than a one-shot, prefer the built-in\n// AudioPlayer / AudioPlayer3D components routed through AudioMixer buses.",
  "Tags": "// Find enemies in range\nconst enemies = RE.Tags.getWithAll(\"enemy\");\nconst threats = RE.Tags.getWithAny(\"enemy\", \"obstacle\");\n\n// Check tags\nif (RE.Tags.hasAny(target, \"enemy\", \"destructible\")) {\n  this.attack(target);\n}",
  "Events": "// Always cleanup listeners\nconst listener = RE.onObjectAdded((obj, target) => {\n  console.log(obj.name, \"added to\", target.name);\n});\n\n// In onBeforeRemoved:\nlistener.stop();"
};

/** Member-level examples, keyed by "ClassName.memberName". */
export const MEMBER_EXAMPLES: Record<string, string> = {
  "App.loadScene": "RE.App.loadScene(\"MainMenu\");\nRE.App.loadScene(\"Level1\");",
  "Component.get": "const player = PlayerController.get();\nconst health = HealthComponent.get(targetObject, true);\nconst ctrl = EnemyController.get(this.object3d);\n\n// Every instance in the scene -- note this is a free function\n// on RE, not a static on the component class:\nconst allEnemies = RE.getComponents(EnemyController);",
  "Component.require": "@RapierBody.require()\nbody: RapierBody;",
  "Input.setActionMap": "RE.Input.setActionMap({\n  Move: {\n    type: \"Axes\",\n    Keyboard: [\"KeyW\", \"KeyS\", \"KeyA\", \"KeyD\"],\n    Gamepad: { x: 0, y: 1 },\n  },\n  Jump: { type: \"Button\", Keyboard: \"Space\", Gamepad: 0 },\n  Fire: { type: \"Button\", Mouse: 0, Gamepad: 7 },\n});",
  "Input.bindAxes": "RE.Input.bindAxes(\"Move\", { Keyboard: [\"KeyW\", \"KeyS\", \"KeyA\", \"KeyD\"] });",
  "Input.bindButton": "RE.Input.bindButton(\"Jump\", { Keyboard: \"Space\", Gamepad: 0 });",
  "Input.getAxes": "const { x, y } = RE.Input.getAxes(\"Move\");",
  "Input.getDown": "if (RE.Input.getDown(\"Jump\")) { this.jump(); }",
  "Input.getPressed": "if (RE.Input.getPressed(\"Fire\")) { this.shoot(); }",
  "Keyboard.getKeyDown": "if (RE.Input.keyboard.getKeyDown(\"Space\")) { this.jump(); }",
  "Keyboard.getKeyPressed": "if (RE.Input.keyboard.getKeyPressed(\"KeyW\")) { this.moveForward(); }",
  "Prefab.instantiate": "const enemy = await RE.Prefab.instantiate(\"Enemies/Nemesis\");",
  "Prefab.fetch": "const prefab = await RE.Prefab.fetch(\"Enemies/Nemesis\");\nconst instance = prefab.instantiate();",
  "Prefab.get": "const prefab = RE.Prefab.get(\"Enemies/Nemesis\");"
};

/** Decorator examples, keyed by decorator name (e.g. "select", "list.num"). */
export const DECORATOR_EXAMPLES: Record<string, string> = {
  "num": "@RE.props.num(0, 100, 1)\nspeed: number = 10;",
  "text": "@RE.props.text()\nplayerName: string = \"Player\";",
  "checkbox": "@RE.props.checkbox()\nisEnabled: boolean = true;",
  "select": "// CORRECT pattern - options as instance property\n@RE.props.select() mode = 0;\nmodeOptions = [\"Easy\", \"Medium\", \"Hard\"];\n\n// The options array MUST:\n// 1. Be an instance property (NOT static)\n// 2. Be named exactly {propertyName}Options\n// 3. Immediately follow the decorated property\n// 4. Contain string values for the dropdown\n\n// ❌ WRONG - static will NOT work\n// static modeOptions = [\"Easy\", \"Medium\", \"Hard\"];\n\n// Multiple selects example:\n@RE.props.select() environment = 0;\nenvironmentOptions = [\"OFFLINE\", \"DEV\", \"PRODUCTION\"];\n\n@RE.props.select() userRole = 0;\nuserRoleOptions = [\"DM\", \"Player\"];",
  "vector2": "@RE.props.vector2()\noffset: THREE.Vector2 = new THREE.Vector2();",
  "vector3": "@RE.props.vector3()\ntargetPosition: THREE.Vector3 = new THREE.Vector3();",
  "color": "@RE.props.color()\ntint: THREE.Color = new THREE.Color(0xffffff);",
  "object3d": "@RE.props.object3d()\ntarget: THREE.Object3D;",
  "component": "@RE.props.component(PlayerController)\nplayer: PlayerController;",
  "prefab": "@RE.props.prefab()\nbulletPrefab: RE.Prefab;",
  "audio": "@RE.props.audio()\nshootSound: RE.AudioAsset;",
  "material": "@RE.props.material()\nhighlightMaterial: THREE.Material;",
  "texture": "@RE.props.texture()\ndiffuseMap: THREE.Texture;"
};

/** Decorator description overrides where the shipped JSDoc is wrong or thin. */
export const DECORATOR_DESCRIPTIONS: Record<string, string> = {
  "num": "Exposes a numeric property with optional min/max/step constraints.",
  "text": "Exposes a string property.",
  "checkbox": "Exposes a boolean property as a checkbox.",
  "select": "Exposes a dropdown selection. IMPORTANT: Requires an instance property (NOT static) named {propertyName}Options immediately after the decorated property.",
  "vector2": "Exposes a Vector2 property with UI.",
  "vector3": "Exposes a Vector3 property with UI.",
  "color": "Exposes a color property with color picker.",
  "object3d": "Reference to a scene object.",
  "component": "Reference to another component instance.",
  "prefab": "Reference to a prefab asset.",
  "audio": "Reference to an audio asset.",
  "material": "Reference to a material.",
  "texture": "Reference to a texture."
};

/** Class description overrides. Generated JSDoc wins unless a key exists here. */
export const CLASS_DESCRIPTIONS: Record<string, string> = {};

/** How the symbol is reached, e.g. "RE.Runtime". Generated data has no notion of this. */
export const CLASS_ACCESS: Record<string, string> = {
  Runtime: "RE.Runtime",
  App: "RE.App",
  Input: "RE.Input",
  Tags: "RE.Tags",
  Debug: "RE.Debug",
  AssetManager: "RE.AssetManager",
  props: "RE.props",
};
