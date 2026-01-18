/**
 * Rogue Engine Documentation Data
 * Embedded documentation for MCP documentation tools
 */

// ============================================================================
// CATEGORIES
// ============================================================================

export const CATEGORIES = [
  { name: 'Core', classes: ['App', 'Component', 'VisualComponent', 'SceneController', 'Runtime'] },
  { name: 'Input', classes: ['Input', 'Mouse', 'Keyboard', 'TouchController', 'GamepadController'] },
  { name: 'Assets', classes: ['Prefab', 'AudioAsset'] },
  { name: 'Utilities', classes: ['Debug', 'Tags'] },
  { name: 'Functions', classes: ['Functions'] },
  { name: 'Events', classes: ['Events'] },
];

// ============================================================================
// DECORATORS
// ============================================================================

export interface DecoratorInfo {
  name: string;
  syntax: string;
  description: string;
  propertyType: string;
  example: string;
}

export const DECORATORS: DecoratorInfo[] = [
  {
    name: 'num',
    syntax: '@RE.props.num(min?: number, max?: number, step?: number)',
    description: 'Exposes a numeric property with optional min/max/step constraints.',
    propertyType: 'number',
    example: `@RE.props.num(0, 100, 1)
speed: number = 10;`,
  },
  {
    name: 'text',
    syntax: '@RE.props.text()',
    description: 'Exposes a string property.',
    propertyType: 'string',
    example: `@RE.props.text()
playerName: string = "Player";`,
  },
  {
    name: 'checkbox',
    syntax: '@RE.props.checkbox()',
    description: 'Exposes a boolean property as a checkbox.',
    propertyType: 'boolean',
    example: `@RE.props.checkbox()
isEnabled: boolean = true;`,
  },
  {
    name: 'select',
    syntax: '@RE.props.select()',
    description: 'Exposes a dropdown selection. IMPORTANT: Requires an instance property (NOT static) named {propertyName}Options immediately after the decorated property.',
    propertyType: 'number',
    example: `// CORRECT pattern - options as instance property
@RE.props.select() mode = 0;
modeOptions = ["Easy", "Medium", "Hard"];

// The options array MUST:
// 1. Be an instance property (NOT static)
// 2. Be named exactly {propertyName}Options
// 3. Immediately follow the decorated property
// 4. Contain string values for the dropdown

// ❌ WRONG - static will NOT work
// static modeOptions = ["Easy", "Medium", "Hard"];

// Multiple selects example:
@RE.props.select() environment = 0;
environmentOptions = ["OFFLINE", "DEV", "PRODUCTION"];

@RE.props.select() userRole = 0;
userRoleOptions = ["DM", "Player"];`,
  },
  {
    name: 'vector2',
    syntax: '@RE.props.vector2()',
    description: 'Exposes a Vector2 property with UI.',
    propertyType: 'THREE.Vector2',
    example: `@RE.props.vector2()
offset: THREE.Vector2 = new THREE.Vector2();`,
  },
  {
    name: 'vector3',
    syntax: '@RE.props.vector3()',
    description: 'Exposes a Vector3 property with UI.',
    propertyType: 'THREE.Vector3',
    example: `@RE.props.vector3()
targetPosition: THREE.Vector3 = new THREE.Vector3();`,
  },
  {
    name: 'color',
    syntax: '@RE.props.color()',
    description: 'Exposes a color property with color picker.',
    propertyType: 'THREE.Color',
    example: `@RE.props.color()
tint: THREE.Color = new THREE.Color(0xffffff);`,
  },
  {
    name: 'object3d',
    syntax: '@RE.props.object3d()',
    description: 'Reference to a scene object.',
    propertyType: 'THREE.Object3D',
    example: `@RE.props.object3d()
target: THREE.Object3D;`,
  },
  {
    name: 'component',
    syntax: '@RE.props.component(ComponentClass)',
    description: 'Reference to another component instance.',
    propertyType: 'Component',
    example: `@RE.props.component(PlayerController)
player: PlayerController;`,
  },
  {
    name: 'prefab',
    syntax: '@RE.props.prefab()',
    description: 'Reference to a prefab asset.',
    propertyType: 'RE.Prefab',
    example: `@RE.props.prefab()
bulletPrefab: RE.Prefab;`,
  },
  {
    name: 'audio',
    syntax: '@RE.props.audio()',
    description: 'Reference to an audio asset.',
    propertyType: 'RE.AudioAsset',
    example: `@RE.props.audio()
shootSound: RE.AudioAsset;`,
  },
  {
    name: 'material',
    syntax: '@RE.props.material()',
    description: 'Reference to a material.',
    propertyType: 'THREE.Material',
    example: `@RE.props.material()
highlightMaterial: THREE.Material;`,
  },
  {
    name: 'texture',
    syntax: '@RE.props.texture()',
    description: 'Reference to a texture.',
    propertyType: 'THREE.Texture',
    example: `@RE.props.texture()
diffuseMap: THREE.Texture;`,
  },
];

// ============================================================================
// LIFECYCLE
// ============================================================================

export interface LifecycleMethod {
  name: string;
  description: string;
  whenCalled: string;
  example?: string;
}

export const LIFECYCLE: LifecycleMethod[] = [
  {
    name: 'awake()',
    description: 'Initialize variables and setup state. Called before any other lifecycle method.',
    whenCalled: 'Once, before the first frame and before start()',
    example: `awake() {
  this.velocity = new THREE.Vector3();
  this.isReady = false;
}`,
  },
  {
    name: 'start()',
    description: 'Setup that may depend on other components being ready.',
    whenCalled: 'Once, after awake() and when the component is ready',
    example: `start() {
  this.playerController = PlayerController.get(this.object3d);
  console.log("Component started on:", this.object3d.name);
}`,
  },
  {
    name: 'beforeUpdate()',
    description: 'Pre-update logic that runs before the main update.',
    whenCalled: 'Every frame, before update()',
  },
  {
    name: 'update()',
    description: 'Primary game loop logic. Use RE.Runtime.deltaTime for frame-independent movement.',
    whenCalled: 'Every frame',
    example: `update() {
  this.object3d.position.x += this.speed * RE.Runtime.deltaTime;
}`,
  },
  {
    name: 'afterUpdate()',
    description: 'Post-update logic that runs after the main update.',
    whenCalled: 'Every frame, after update()',
  },
  {
    name: 'onBeforeRemoved()',
    description: 'Cleanup: remove event listeners, dispose resources, stop sounds.',
    whenCalled: 'Once, just before the component is removed',
    example: `onBeforeRemoved() {
  this.eventListener?.stop();
  this.sound?.stop();
}`,
  },
];

// ============================================================================
// CLASS INFO
// ============================================================================

export interface PropertyInfo {
  name: string;
  type: string;
  description: string;
  readonly?: boolean;
}

export interface MethodInfo {
  name: string;
  signature: string;
  description: string;
  example?: string;
}

export interface ClassInfo {
  name: string;
  description: string;
  access?: string;
  properties: PropertyInfo[];
  methods: MethodInfo[];
  staticMethods?: MethodInfo[];
  events?: MethodInfo[];
  example?: string;
}

export const CLASS_INFO: Record<string, ClassInfo> = {
  App: {
    name: 'App',
    description: 'Handles scene management and provides access to the main application state.',
    access: 'RE.App',
    properties: [
      { name: 'currentScene', type: 'string', description: 'The name of the currently loaded scene.', readonly: true },
      { name: 'sceneController', type: 'SceneController', description: 'The active SceneController instance.', readonly: true },
    ],
    methods: [
      {
        name: 'loadScene',
        signature: 'loadScene(sceneName: string): void',
        description: 'Load a scene by name.',
        example: `RE.App.loadScene("MainMenu");
RE.App.loadScene("Level1");`,
      },
    ],
  },

  Component: {
    name: 'Component',
    description: 'Base class for game logic. Components are scripts attached to THREE.Object3D instances.',
    properties: [
      { name: 'object3d', type: 'THREE.Object3D', description: 'The Object3D this component is attached to.', readonly: true },
      { name: 'name', type: 'string', description: 'The name of this component.' },
      { name: 'initialized', type: 'boolean', description: 'Whether the component has been initialized.', readonly: true },
    ],
    methods: [],
    staticMethods: [
      {
        name: 'get',
        signature: 'static get(object?: THREE.Object3D, inAncestor?: boolean): T | undefined',
        description: 'Get an instance of this component type. Searches on object and optionally ancestors.',
        example: `const player = PlayerController.get();
const health = HealthComponent.get(targetObject, true);`,
      },
      {
        name: 'getAll',
        signature: 'static getAll(): T[]',
        description: 'Get all instances of this component type in the scene.',
        example: `const allEnemies = EnemyController.getAll();`,
      },
      {
        name: 'require',
        signature: '@ComponentClass.require()',
        description: 'Decorator for dependency injection. Gets a sibling component.',
        example: `@RapierBody.require()
body: RapierBody;`,
      },
    ],
    example: `import * as RE from 'rogue-engine';

export default class MyComponent extends RE.Component {
  awake() { }
  start() { }
  update() { }
  onBeforeRemoved() { }
}

RE.registerComponent(MyComponent);`,
  },

  VisualComponent: {
    name: 'VisualComponent',
    description: 'Component with visual representation. Extends Component.',
    properties: [],
    methods: [],
  },

  Input: {
    name: 'Input',
    description: 'Unified input handling system for keyboard, mouse, touch, and gamepad.',
    access: 'RE.Input',
    properties: [
      { name: 'mouse', type: 'Mouse', description: 'Mouse input controller.' },
      { name: 'keyboard', type: 'Keyboard', description: 'Keyboard input controller.' },
      { name: 'touch', type: 'TouchController', description: 'Touch input controller.' },
      { name: 'gamepads', type: 'GamepadController[]', description: 'Connected gamepad controllers.' },
      { name: 'playerInputs', type: '{ MouseAndKeyboard: number; Gamepads: number[] }', description: 'Input configuration for multiplayer. Numbers represent player index.' },
    ],
    methods: [
      {
        name: 'setActionMap',
        signature: 'setActionMap(bindings: InputAction): void',
        description: 'Set all input bindings at once for action-based input.',
        example: `RE.Input.setActionMap({
  Move: {
    type: "Axes",
    Keyboard: ["KeyW", "KeyS", "KeyA", "KeyD"],
    Gamepad: { x: 0, y: 1 },
  },
  Jump: { type: "Button", Keyboard: "Space", Gamepad: 0 },
  Fire: { type: "Button", Mouse: 0, Gamepad: 7 },
});`,
      },
      {
        name: 'bindAxes',
        signature: 'bindAxes(actionName: string, bind: {...}, player?: number): void',
        description: 'Bind an axes-based action.',
        example: `RE.Input.bindAxes("Move", { Keyboard: ["KeyW", "KeyS", "KeyA", "KeyD"] });`,
      },
      {
        name: 'bindButton',
        signature: 'bindButton(actionName: string, bind: {...}, player?: number): void',
        description: 'Bind a button-based action.',
        example: `RE.Input.bindButton("Jump", { Keyboard: "Space", Gamepad: 0 });`,
      },
      {
        name: 'getAxes',
        signature: 'getAxes(name: string, player?: number): { x: number, y: number }',
        description: 'Get axes values for an action.',
        example: `const { x, y } = RE.Input.getAxes("Move");`,
      },
      {
        name: 'getDown',
        signature: 'getDown(name: string, player?: number): boolean',
        description: 'Returns true on the frame a button action is pressed.',
        example: `if (RE.Input.getDown("Jump")) { this.jump(); }`,
      },
      {
        name: 'getUp',
        signature: 'getUp(name: string, player?: number): boolean',
        description: 'Returns true on the frame a button action is released.',
      },
      {
        name: 'getPressed',
        signature: 'getPressed(name: string, player?: number): number | true',
        description: 'Returns true/value while button is held.',
        example: `if (RE.Input.getPressed("Fire")) { this.shoot(); }`,
      },
      {
        name: 'getPlayerConfig',
        signature: 'getPlayerConfig(player?: number): { gamepadIndex: number | undefined; useMouseAndKeyboard: boolean }',
        description: 'Get input configuration for a specific player.',
      },
    ],
  },

  Mouse: {
    name: 'Mouse',
    description: 'Mouse input handling.',
    access: 'RE.Input.mouse',
    properties: [
      { name: 'x', type: 'number', description: 'Mouse X position (clientX).' },
      { name: 'y', type: 'number', description: 'Mouse Y position (clientY).' },
      { name: 'viewX', type: 'number', description: 'X position relative to canvas.' },
      { name: 'viewY', type: 'number', description: 'Y position relative to canvas.' },
      { name: 'movementX', type: 'number', description: 'Mouse X movement delta.' },
      { name: 'movementY', type: 'number', description: 'Mouse Y movement delta.' },
      { name: 'wheelX', type: 'number', description: 'Horizontal scroll amount.' },
      { name: 'wheelY', type: 'number', description: 'Vertical scroll amount.' },
      { name: 'isMoving', type: 'boolean', description: 'True if mouse is moving.' },
      { name: 'isLeftButtonDown', type: 'boolean', description: 'True on frame left button pressed.' },
      { name: 'isLeftButtonPressed', type: 'boolean', description: 'True while left button held.' },
      { name: 'isLeftButtonUp', type: 'boolean', description: 'True on frame left button released.' },
      { name: 'isRightButtonDown', type: 'boolean', description: 'True on frame right button pressed.' },
      { name: 'isRightButtonPressed', type: 'boolean', description: 'True while right button held.' },
      { name: 'isRightButtonUp', type: 'boolean', description: 'True on frame right button released.' },
      { name: 'isMidButtonDown', type: 'boolean', description: 'True on frame middle button pressed.' },
      { name: 'isMidButtonPressed', type: 'boolean', description: 'True while middle button held.' },
      { name: 'isMidButtonUp', type: 'boolean', description: 'True on frame middle button released.' },
      { name: 'pointerLock', type: 'PointerLockControls', description: 'Pointer lock controls instance.' },
      { name: 'enabled', type: 'boolean', description: 'Enable/disable mouse controls.' },
    ],
    methods: [
      { name: 'lock', signature: 'lock(): void', description: 'Lock the mouse pointer.' },
      { name: 'unlock', signature: 'unlock(): void', description: 'Unlock the mouse pointer.' },
      { name: 'getButtonDown', signature: 'getButtonDown(button: number): boolean', description: 'True on frame button pressed. 0=left, 1=middle, 2=right.' },
      { name: 'getButtonPressed', signature: 'getButtonPressed(button: number): boolean', description: 'True while button held.' },
      { name: 'getButtonUp', signature: 'getButtonUp(button: number): boolean', description: 'True on frame button released.' },
    ],
  },

  Keyboard: {
    name: 'Keyboard',
    description: 'Keyboard input handling. Uses KeyboardEvent.code values.',
    access: 'RE.Input.keyboard',
    properties: [],
    methods: [
      {
        name: 'getKeyDown',
        signature: 'getKeyDown(keyCode: string): boolean',
        description: 'True on the frame the key was pressed.',
        example: `if (RE.Input.keyboard.getKeyDown("Space")) { this.jump(); }`,
      },
      {
        name: 'getKeyPressed',
        signature: 'getKeyPressed(keyCode: string): boolean',
        description: 'True while the key is held down.',
        example: `if (RE.Input.keyboard.getKeyPressed("KeyW")) { this.moveForward(); }`,
      },
      {
        name: 'getKeyUp',
        signature: 'getKeyUp(keyCode: string): boolean',
        description: 'True on the frame the key was released.',
      },
    ],
    example: `Common key codes:
- "KeyW", "KeyA", "KeyS", "KeyD" - WASD
- "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight" - Arrows
- "Space", "Enter", "Escape", "Tab"
- "ShiftLeft", "ShiftRight", "ControlLeft", "ControlRight"
- "Digit0" - "Digit9" - Number keys
- "F1" - "F12" - Function keys`,
  },

  TouchController: {
    name: 'TouchController',
    description: 'Touch input handling.',
    access: 'RE.Input.touch',
    properties: [
      { name: 'touches', type: 'TouchInteraction[]', description: 'All current touch events.' },
      { name: 'startTouches', type: 'TouchInteraction[]', description: 'Touches that started this frame.' },
      { name: 'endTouches', type: 'TouchInteraction[]', description: 'Touches that ended this frame.' },
      { name: 'leftTouches', type: 'TouchInteraction[]', description: 'Touches on left half of screen.' },
      { name: 'rightTouches', type: 'TouchInteraction[]', description: 'Touches on right half of screen.' },
      { name: 'leftStartTouches', type: 'TouchInteraction[]', description: 'New touches on left half this frame.' },
      { name: 'rightStartTouches', type: 'TouchInteraction[]', description: 'New touches on right half this frame.' },
      { name: 'leftEndTouches', type: 'TouchInteraction[]', description: 'Ended touches on left half this frame.' },
      { name: 'rightEndTouches', type: 'TouchInteraction[]', description: 'Ended touches on right half this frame.' },
      { name: 'buttons', type: 'TouchButton[]', description: 'Registered touch buttons.' },
      { name: 'enabled', type: 'boolean', description: 'Enable/disable touch controls.' },
    ],
    methods: [
      {
        name: 'createButton',
        signature: 'createButton(elem: HTMLDivElement, stopPropagation?: boolean): TouchButton',
        description: 'Create a touch button from an HTML element.',
      },
    ],
  },

  GamepadController: {
    name: 'GamepadController',
    description: 'Gamepad input handling.',
    access: 'RE.Input.gamepads[index]',
    properties: [
      { name: 'axesErrorMargin', type: 'number', description: 'Dead zone for analog sticks. Default: 0.1' },
      { name: 'gamepad', type: 'Gamepad', description: 'The native Gamepad object.', readonly: true },
    ],
    methods: [
      {
        name: 'getAxis',
        signature: 'getAxis(index: number): number',
        description: 'Get axis value (-1 to 1). 0=Left X, 1=Left Y, 2=Right X, 3=Right Y.',
      },
      {
        name: 'getButton',
        signature: 'getButton(index: number): number',
        description: 'Get button value (0 to 1). Useful for triggers.',
      },
      {
        name: 'getButtonDown',
        signature: 'getButtonDown(index: number): boolean',
        description: 'True on frame button pressed.',
      },
      {
        name: 'getButtonUp',
        signature: 'getButtonUp(index: number): boolean',
        description: 'True on frame button released.',
      },
    ],
    example: `Standard button mapping:
0=A/Cross, 1=B/Circle, 2=X/Square, 3=Y/Triangle
4=LB, 5=RB, 6=LT, 7=RT
8=Select, 9=Start
10=Left Stick, 11=Right Stick
12-15=D-Pad (Up, Down, Left, Right)`,
  },

  Runtime: {
    name: 'Runtime',
    description: 'Singleton that extends SceneController. Governs the playing scene state.',
    access: 'RE.Runtime',
    properties: [
      { name: 'scene', type: 'THREE.Scene', description: 'The current scene.', readonly: true },
      { name: 'camera', type: 'THREE.Camera', description: 'The active camera.' },
      { name: 'deltaTime', type: 'number', description: 'Seconds since last frame.', readonly: true },
      { name: 'clock', type: 'THREE.Clock', description: 'Time tracking clock.', readonly: true },
      { name: 'width', type: 'number', description: 'Renderer width.', readonly: true },
      { name: 'height', type: 'number', description: 'Renderer height.', readonly: true },
      { name: 'renderer', type: 'THREE.WebGLRenderer', description: 'The WebGL renderer.', readonly: true },
      { name: 'rogueDOMContainer', type: 'HTMLElement', description: 'The HTML element containing the canvas.', readonly: true },
      { name: 'containerId', type: 'string', description: 'ID of the HTML container element.', readonly: true },
      { name: 'isRunning', type: 'boolean', description: 'Whether animation loop is running.', readonly: true },
      { name: 'isPaused', type: 'boolean', description: 'Whether runtime is paused.', readonly: true },
      { name: 'renderFunc', type: '() => void', description: 'Custom render function for post-processing.' },
      { name: 'defaultRenderFunc', type: '() => void', description: 'Reference to the default render function.', readonly: true },
      { name: 'resolution', type: 'number', description: 'Max screen width before scaling pixel ratio. 0/undefined = unrestricted.' },
      { name: 'aspectRatio', type: 'number', description: 'Fixed aspect ratio for canvas. 0/undefined = unrestricted.' },
      { name: 'useAspectRatio', type: 'boolean', description: 'Whether to apply the aspect ratio.' },
    ],
    methods: [
      { name: 'pause', signature: 'pause(): void', description: 'Pause the animation loop.' },
      { name: 'resume', signature: 'resume(): void', description: 'Resume the animation loop.' },
      { name: 'togglePause', signature: 'togglePause(): void', description: 'Toggle pause state.' },
      { name: 'setFullscreen', signature: 'setFullscreen(): void', description: 'Request browser fullscreen.' },
    ],
    events: [
      { name: 'onPlay', signature: 'onPlay(callback: () => any): { stop: () => void }', description: 'Hook into initialization.' },
      { name: 'onStop', signature: 'onStop(callback: () => any): { stop: () => void }', description: 'Hook into shutdown/cleanup.' },
    ],
    example: `// Frame-independent movement
this.object3d.position.x += this.speed * RE.Runtime.deltaTime;

// Get elapsed time
const elapsed = RE.Runtime.clock.getElapsedTime();`,
  },

  SceneController: {
    name: 'SceneController',
    description: 'Abstract class defining scene lifecycle. Runtime extends this.',
    properties: [],
    methods: [],
  },

  Prefab: {
    name: 'Prefab',
    description: 'Predefined Object3D stored in .roguePrefab files for instantiation.',
    properties: [
      { name: 'uuid', type: 'string', description: 'Unique identifier.', readonly: true },
      { name: 'path', type: 'string', description: 'Path to prefab file.', readonly: true },
      { name: 'name', type: 'string', description: 'Name of the prefab.', readonly: true },
    ],
    methods: [
      {
        name: 'instantiate',
        signature: 'instantiate(parent?: THREE.Object3D): THREE.Object3D',
        description: 'Instantiate the prefab into the scene.',
        example: `const bullet = this.bulletPrefab.instantiate();
bullet.position.copy(this.object3d.position);`,
      },
    ],
    staticMethods: [
      {
        name: 'instantiate',
        signature: 'static instantiate(name: string): Promise<THREE.Object3D>',
        description: 'Async instantiate by name path (relative to Assets/Prefabs/).',
        example: `const enemy = await RE.Prefab.instantiate("Enemies/Nemesis");`,
      },
      {
        name: 'fetch',
        signature: 'static fetch(name: string): Promise<Prefab>',
        description: 'Async fetch prefab without instantiating.',
        example: `const prefab = await RE.Prefab.fetch("Enemies/Nemesis");
const instance = prefab.instantiate();`,
      },
      {
        name: 'get',
        signature: 'static get(name: string): Prefab',
        description: 'Sync get prefab (must be preloaded).',
        example: `const prefab = RE.Prefab.get("Enemies/Nemesis");`,
      },
      {
        name: 'namedPrefabUUIDs',
        signature: 'static namedPrefabUUIDs: Record<string, string>',
        description: 'Map of prefab UUIDs with paths relative to Assets/Prefabs/ as keys.',
      },
    ],
  },

  AudioAsset: {
    name: 'AudioAsset',
    description: 'Audio asset for playback.',
    properties: [],
    methods: [
      { name: 'play', signature: 'play(): void', description: 'Play the audio.' },
      { name: 'stop', signature: 'stop(): void', description: 'Stop the audio.' },
    ],
    example: `@RE.props.audio()
shootSound: RE.AudioAsset;

fire() {
  this.shootSound?.play();
}`,
  },

  Debug: {
    name: 'Debug',
    description: 'Logging utilities for the editor console.',
    access: 'RE.Debug',
    properties: [],
    methods: [
      { name: 'log', signature: 'log(message: string): void', description: 'Log a standard message (white).' },
      { name: 'logWarning', signature: 'logWarning(message: string): void', description: 'Log a warning (yellow).' },
      { name: 'logError', signature: 'logError(message: string): void', description: 'Log an error (red).' },
      { name: 'clear', signature: 'clear(): void', description: 'Clear all logs.' },
    ],
    events: [
      { name: 'onAddLog', signature: 'onAddLog(callback: (log: Log) => void): { stop: () => void }', description: 'Hook into log events.' },
      { name: 'onClearLogs', signature: 'onClearLogs(callback: () => void): { stop: () => void }', description: 'Hook into log clear.' },
    ],
  },

  Tags: {
    name: 'Tags',
    description: 'Object tagging system for classification and querying.',
    access: 'RE.Tags',
    properties: [],
    methods: [
      { name: 'getTags', signature: 'getTags(): string[]', description: 'Get all registered tags.' },
      { name: 'getObjects', signature: 'getObjects(tag: string): THREE.Object3D[]', description: 'Get all objects with a tag.' },
      { name: 'getWithAll', signature: 'getWithAll(...tags: string[]): THREE.Object3D[]', description: 'Get objects with ALL tags (AND).' },
      { name: 'getWithAny', signature: 'getWithAny(...tags: string[]): THREE.Object3D[]', description: 'Get objects with ANY tag (OR).' },
      { name: 'hasAny', signature: 'hasAny(object: THREE.Object3D, ...tags: string[]): boolean', description: 'Check if object has any tag.' },
      { name: 'hasAll', signature: 'hasAll(object: THREE.Object3D, ...tags: string[]): boolean', description: 'Check if object has all tags.' },
      { name: 'hasNone', signature: 'hasNone(object: THREE.Object3D, ...tags: string[]): boolean', description: 'Check if object has none of tags.' },
      { name: 'isMissingAll', signature: 'isMissingAll(object: THREE.Object3D, ...tags: string[]): boolean', description: 'Check if object is missing all of the specified tags.' },
      { name: 'get', signature: 'get(object: THREE.Object3D): string[]', description: 'Get all tags of an object.' },
      { name: 'set', signature: 'set(object: THREE.Object3D, ...tags: string[]): void', description: 'Set tags on an object.' },
      { name: 'remove', signature: 'remove(object: THREE.Object3D, ...tags: string[]): void', description: 'Remove tags from an object.' },
      { name: 'create', signature: 'create(...tags: string[]): void', description: 'Create tags without assigning.' },
    ],
    example: `// Find enemies in range
const enemies = RE.Tags.getWithAll("enemy");
const threats = RE.Tags.getWithAny("enemy", "obstacle");

// Check tags
if (RE.Tags.hasAny(target, "enemy", "destructible")) {
  this.attack(target);
}`,
  },

  Functions: {
    name: 'Functions',
    description: 'Global utility functions from the RE namespace.',
    properties: [],
    methods: [
      { name: 'registerComponent', signature: 'registerComponent<T>(ComponentClass): void', description: 'Register a component class.' },
      { name: 'addComponent', signature: 'addComponent(component: Component): void', description: 'Add component to engine.' },
      { name: 'removeComponent', signature: 'removeComponent(component: Component): void', description: 'Remove component from engine.' },
      { name: 'getComponent', signature: 'getComponent<T>(Class, object?, inAncestor?): T', description: 'Get component of type.' },
      { name: 'getComponents', signature: 'getComponents<T>(Class): T[]', description: 'Get all components of type.' },
      { name: 'getObjectComponents', signature: 'getObjectComponents(object): Component[]', description: 'Get all components on object.' },
      { name: 'getComponentByName', signature: 'getComponentByName(name: string, object?: Object3D, inAncestor?: boolean): Component | undefined', description: 'Find component by class name.' },
      { name: 'traverseComponents', signature: 'traverseComponents(fn: (component: Component, objectUUID: string, index: number) => void): void', description: 'Run a function for every component in the scene.' },
      { name: 'removeComponents', signature: 'removeComponents(object: Object3D, recursive?: boolean): void', description: 'Remove all components from an Object3D.' },
      { name: 'setEnabled', signature: 'setEnabled(object: Object3D, enabled: boolean): void', description: 'Enable/disable object and components.' },
      { name: 'isEnabled', signature: 'isEnabled(object: Object3D): boolean', description: 'Check if object is enabled.' },
      { name: 'isActive', signature: 'isActive(object: Object3D): boolean', description: 'Check if object is active (considers ancestors).' },
      { name: 'pick', signature: 'pick(targets: Object3D[]): THREE.Intersection[]', description: 'Pick objects under pointer.' },
      { name: 'getNearestWithTag', signature: 'getNearestWithTag(obj, tag): Object3D', description: 'Get nearest ancestor with tag.' },
      { name: 'getNearestGroup', signature: 'getNearestGroup(obj): THREE.Group', description: 'Get nearest Group ancestor.' },
      { name: 'getNormalizedDeviceCoordinates', signature: 'getNormalizedDeviceCoordinates(x, y): {x, y}', description: 'Convert to NDC (-1 to 1).' },
      { name: 'getStaticPath', signature: 'getStaticPath(path: string): string', description: 'Get full path to static asset.' },
      { name: 'randomRange', signature: 'randomRange(min, max, floor?): number', description: 'Random number in range.' },
    ],
  },

  Events: {
    name: 'Events',
    description: 'Global event listeners. All return { stop() } for cleanup.',
    properties: [],
    methods: [
      { name: 'onObjectAdded', signature: 'onObjectAdded(callback: (object, target) => void): { stop }', description: 'When Object3D.add() is called.' },
      { name: 'onObjectRemoved', signature: 'onObjectRemoved(callback: (object, target) => void): { stop }', description: 'When Object3D.remove() is called.' },
      { name: 'onComponentAdded', signature: 'onComponentAdded(callback: (component, target) => void): { stop }', description: 'When component is added.' },
      { name: 'onComponentRemoved', signature: 'onComponentRemoved(callback: (component, target) => void): { stop }', description: 'When component is removed.' },
      { name: 'onBeforeUpdate', signature: 'onBeforeUpdate(callback: (sc) => void): { stop }', description: 'Runs in beforeUpdate phase.' },
      { name: 'onUpdate', signature: 'onUpdate(callback: (sc) => void): { stop }', description: 'Runs in update phase.' },
      { name: 'onAfterUpdate', signature: 'onAfterUpdate(callback: (sc) => void): { stop }', description: 'Runs in afterUpdate phase.' },
      { name: 'onNextFrame', signature: 'onNextFrame(callback: (sc) => void): void', description: 'Runs once on next frame.' },
    ],
    example: `// Always cleanup listeners
const listener = RE.onObjectAdded((obj, target) => {
  console.log(obj.name, "added to", target.name);
});

// In onBeforeRemoved:
listener.stop();`,
  },
};

// ============================================================================
// SEARCH FUNCTION
// ============================================================================

export interface SearchResult {
  className: string;
  section: string;
  content: string;
  relevance: number;
}

export function searchDocs(query: string): SearchResult[] {
  const results: SearchResult[] = [];
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);

  for (const [className, classInfo] of Object.entries(CLASS_INFO)) {
    // Search in description
    if (classInfo.description.toLowerCase().includes(queryLower)) {
      results.push({
        className,
        section: 'description',
        content: classInfo.description,
        relevance: 3,
      });
    }

    // Search in properties
    for (const prop of classInfo.properties) {
      const searchText = `${prop.name} ${prop.type} ${prop.description}`.toLowerCase();
      if (queryWords.some(w => searchText.includes(w))) {
        results.push({
          className,
          section: 'property',
          content: `${prop.name}: ${prop.type} - ${prop.description}`,
          relevance: 2,
        });
      }
    }

    // Search in methods
    for (const method of classInfo.methods) {
      const searchText = `${method.name} ${method.signature} ${method.description}`.toLowerCase();
      if (queryWords.some(w => searchText.includes(w))) {
        results.push({
          className,
          section: 'method',
          content: `${method.signature} - ${method.description}`,
          relevance: 2,
        });
      }
    }

    // Search in static methods
    if (classInfo.staticMethods) {
      for (const method of classInfo.staticMethods) {
        const searchText = `${method.name} ${method.signature} ${method.description}`.toLowerCase();
        if (queryWords.some(w => searchText.includes(w))) {
          results.push({
            className,
            section: 'static method',
            content: `${method.signature} - ${method.description}`,
            relevance: 2,
          });
        }
      }
    }

    // Search in example
    if (classInfo.example && classInfo.example.toLowerCase().includes(queryLower)) {
      results.push({
        className,
        section: 'example',
        content: classInfo.example,
        relevance: 1,
      });
    }
  }

  // Search in decorators
  for (const decorator of DECORATORS) {
    const searchText = `${decorator.name} ${decorator.syntax} ${decorator.description}`.toLowerCase();
    if (queryWords.some(w => searchText.includes(w))) {
      results.push({
        className: 'Decorators',
        section: decorator.name,
        content: `${decorator.syntax}\n${decorator.description}\n\nExample:\n${decorator.example}`,
        relevance: 2,
      });
    }
  }

  // Search in lifecycle
  for (const method of LIFECYCLE) {
    const searchText = `${method.name} ${method.description} ${method.whenCalled}`.toLowerCase();
    if (queryWords.some(w => searchText.includes(w))) {
      results.push({
        className: 'Lifecycle',
        section: method.name,
        content: `${method.name} - ${method.description}\nWhen: ${method.whenCalled}`,
        relevance: 2,
      });
    }
  }

  // Sort by relevance
  results.sort((a, b) => b.relevance - a.relevance);

  return results.slice(0, 10); // Return top 10 results
}

// ============================================================================
// FORMAT FUNCTIONS
// ============================================================================

export function formatClassInfo(className: string): string {
  const info = CLASS_INFO[className];
  if (!info) return `Class '${className}' not found.`;

  let output = `# ${info.name}\n\n`;
  output += `${info.description}\n\n`;

  if (info.access) {
    output += `**Access:** \`${info.access}\`\n\n`;
  }

  if (info.properties.length > 0) {
    output += `## Properties\n\n`;
    for (const prop of info.properties) {
      const readonly = prop.readonly ? ' (readonly)' : '';
      output += `- **${prop.name}**: \`${prop.type}\`${readonly}\n  ${prop.description}\n\n`;
    }
  }

  if (info.methods.length > 0) {
    output += `## Methods\n\n`;
    for (const method of info.methods) {
      output += `### ${method.name}\n`;
      output += `\`\`\`typescript\n${method.signature}\n\`\`\`\n`;
      output += `${method.description}\n`;
      if (method.example) {
        output += `\n**Example:**\n\`\`\`typescript\n${method.example}\n\`\`\`\n`;
      }
      output += '\n';
    }
  }

  if (info.staticMethods && info.staticMethods.length > 0) {
    output += `## Static Methods\n\n`;
    for (const method of info.staticMethods) {
      output += `### ${method.name}\n`;
      output += `\`\`\`typescript\n${method.signature}\n\`\`\`\n`;
      output += `${method.description}\n`;
      if (method.example) {
        output += `\n**Example:**\n\`\`\`typescript\n${method.example}\n\`\`\`\n`;
      }
      output += '\n';
    }
  }

  if (info.events && info.events.length > 0) {
    output += `## Events\n\n`;
    for (const event of info.events) {
      output += `### ${event.name}\n`;
      output += `\`\`\`typescript\n${event.signature}\n\`\`\`\n`;
      output += `${event.description}\n\n`;
    }
  }

  if (info.example) {
    output += `## Example\n\n\`\`\`typescript\n${info.example}\n\`\`\`\n`;
  }

  return output;
}

export function formatDecorators(): string {
  let output = `# Rogue Engine Property Decorators\n\n`;
  output += `All decorators are accessed via \`@RE.props.*\`\n\n`;

  for (const dec of DECORATORS) {
    output += `## @RE.props.${dec.name}()\n\n`;
    output += `**Syntax:** \`${dec.syntax}\`\n\n`;
    output += `**Property Type:** \`${dec.propertyType}\`\n\n`;
    output += `${dec.description}\n\n`;
    output += `**Example:**\n\`\`\`typescript\n${dec.example}\n\`\`\`\n\n`;
    output += '---\n\n';
  }

  return output;
}

export function formatLifecycle(): string {
  let output = `# Component Lifecycle Methods\n\n`;
  output += `Lifecycle flow: awake() → start() → [beforeUpdate() → update() → afterUpdate()] (loop) → onBeforeRemoved()\n\n`;

  for (const method of LIFECYCLE) {
    output += `## ${method.name}\n\n`;
    output += `**When Called:** ${method.whenCalled}\n\n`;
    output += `${method.description}\n\n`;
    if (method.example) {
      output += `**Example:**\n\`\`\`typescript\n${method.example}\n\`\`\`\n\n`;
    }
    output += '---\n\n';
  }

  return output;
}

export function formatCategories(): string {
  let output = `# Rogue Engine Documentation Categories\n\n`;

  for (const cat of CATEGORIES) {
    output += `## ${cat.name}\n`;
    output += cat.classes.map(c => `- ${c}`).join('\n');
    output += '\n\n';
  }

  return output;
}

export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No results found.';
  }

  let output = `# Search Results (${results.length})\n\n`;

  for (const result of results) {
    output += `## ${result.className} - ${result.section}\n\n`;
    output += `${result.content}\n\n`;
    output += '---\n\n';
  }

  return output;
}
