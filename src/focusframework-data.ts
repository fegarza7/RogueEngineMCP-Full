// Types mirroring the internal structure of docs-data.ts
interface FFMethodInfo {
  signature: string;
  description: string;
  returns?: string;
  example?: string;
}

interface FFClassInfo {
  name: string;
  description: string;
  category: string;
  installation: string;
  methods: FFMethodInfo[];
  properties?: FFMethodInfo[];
  notes?: string[];
}

export const FF_CLASS_INFO: Record<string, FFClassInfo> = {
  FocusManager: {
    name: 'FocusManager',
    description: 'Central controller that manages state registration, stack-based transitions, and the shared event bus.',
    category: 'FocusFramework',
    installation: "import { FocusManager } from '../rogue_packages/FocusFramework/FocusManager';",
    properties: [
      { signature: 'get current(): string | null', description: 'The currently active state name (top of stack).' },
      { signature: 'get stateStack(): readonly string[]', description: 'All stacked state names; active state at the end.' },
      { signature: 'get uiManager(): UILayerManager', description: 'The UILayerManager instance.' },
      { signature: 'get events(): FocusEventBus', description: 'Shared event bus for decoupled communication.' },
    ],
    methods: [
      { signature: 'create(name: string): FocusState', description: 'Creates a new FocusState builder. Chain .ui(), .onEnter(), .withPrefabs() etc., then call .register().' },
      { signature: 'register(state: FocusState): void', description: 'Registers a fully-configured FocusState. Must be called before switch() or push().' },
      { signature: 'async switch(name: string, payload?: any): Promise<void>', description: 'Replaces the entire state stack with the named state. Triggers onExit on old state and onEnter on new state.' },
      { signature: 'async push(name: string, payload?: any): Promise<void>', description: 'Pushes a new state on top of the stack (e.g. pause menu over game). Old state is suspended but not exited.' },
      { signature: 'async pop(): Promise<void>', description: 'Pops the current state, exiting it and resuming the state below.' },
      { signature: 'is(stateName: string): boolean', description: 'Returns true if the named state is currently active.' },
      { signature: 'getRegisteredStates(): string[]', description: 'Returns all registered state names.' },
      { signature: 'onSwitch(callback: SwitchListener): () => void', description: 'Registers a callback for every state change. Returns an unregister function.' },
      { signature: 'offSwitch(callback: SwitchListener): void', description: 'Unregisters a state-change callback.' },
      { signature: 'static registerTransitionEffect(name: string, effect: FocusTransitionEffect): void', description: 'Registers a named screen transition (e.g. fade, iris) usable in .withTransition().' },
    ],
    notes: [
      'Instantiate in RE component start() method, not awake().',
      'Register base states before derived states that .extends() them.',
      'Use push()/pop() for overlays (pause, settings) to preserve underlying game state.',
      'Built-in visual debugger: press \\ key during runtime.',
    ],
  },

  FocusState: {
    name: 'FocusState',
    description: 'Fluent builder for configuring a named application state. Created via FocusManager.create(), never constructed directly.',
    category: 'FocusFramework',
    installation: "// Created via fm.create('stateName') — no direct import needed",
    methods: [
      { signature: '.extends(baseStateName: string): this', description: 'Inherits configuration from a previously registered state. Own properties override base.' },
      { signature: '.ui({ visible?: string[], preserveOnExit?: string[], cleanupOnExit?: string[], layers?: LayerDefinition }): this', description: 'Declares which UI layers are visible. preserveOnExit keeps content; cleanupOnExit removes the layer on exit.' },
      { signature: '.onEnter(callback: (payload: any, ui: UILayerManager) => void | Promise<void>): this', description: 'Hook executed when entering the state. Render UI here.' },
      { signature: '.onExit(callback: (nextStateName: string) => void | Promise<void>): this', description: 'Hook executed when leaving the state. Teardown logic here.' },
      { signature: '.withPrefabs(...prefabNames: string[]): this', description: 'Auto-instantiate named RogueEngine prefabs on enter; auto-destroy on exit.' },
      { signature: '.withPrefabsBatched(delayMs: number, ...prefabNames: string[]): this', description: 'Like withPrefabs() but instantiates sequentially with a delay to reduce frame stuttering.' },
      { signature: '.withTransition(effectName: string, durationMs?: number): this', description: 'Apply a named transition effect when entering this state.' },
      { signature: ".on(layerName: string, eventType: string, selector: string, callback: (e: Event, target: HTMLElement) => void): this", description: "Delegated DOM event listener scoped to this state's lifecycle." },
      { signature: '.onContainer(layerName: string, eventType: string, callback: (e: Event) => void, options?): this', description: 'Listener on the game container element, auto-removed on state exit.' },
      { signature: '.onEvent(eventName: string, callback: (fm: FocusManager, payload: any) => void): this', description: "Listens to the FocusManager event bus, scoped to this state's lifecycle." },
      { signature: '.onKey(eventType: "keydown"|"keyup"|"keypress", key: string, callback: (fm: FocusManager, e: KeyboardEvent) => void): this', description: "Keyboard listener scoped to this state's lifecycle." },
      { signature: '.dontResetOnExit(layerName: string): this', description: "Prevents a layer's content from being cleared when this state exits." },
      { signature: '.nukeSceneOnEnter(objectsToIgnore?: THREE.Object3D[]): this', description: 'Clears the entire THREE.js scene on state entry (except specified objects and main camera).' },
      { signature: '.ensureLayer(name: string, zIndexOrOptions: number | { zIndex?: number, parent?: string | UILayer }): this', description: "Creates a UI layer when entering if it doesn't already exist." },
    ],
    notes: [
      'All methods are chainable. End the chain by passing the FocusState to fm.register().',
      'Do not call .build() manually — register() does this.',
      'Use .onEvent() instead of direct component references for loose coupling.',
    ],
  },

  UILayerManager: {
    name: 'UILayerManager',
    description: 'Singleton that manages HTML/CSS overlay layers on top of the RogueEngine canvas. Controls creation, visibility, nesting, and destruction.',
    category: 'FocusFramework',
    installation: "import { UILayerManager } from '../rogue_packages/FocusFramework/UILayerManager';",
    methods: [
      { signature: 'static getInstance(): UILayerManager', description: 'Returns the singleton instance. Usually accessed via fm.uiManager instead of calling directly.' },
      { signature: 'create(name: string, zIndex?: number): UILayer', description: 'Creates a new top-level UI layer at the given z-index.' },
      { signature: 'create(name: string, options: { zIndex?: number, parent?: string | UILayer }): UILayer', description: 'Creates a UI layer, optionally as a child of another layer.' },
      { signature: 'find(name: string): UILayer', description: 'Retrieves a layer by name. Throws if not found (use for required layers).' },
      { signature: 'get(name: string): UILayer | undefined', description: 'Retrieves a layer by name. Returns undefined if not found (use for optional layers).' },
      { signature: 'has(name: string): boolean', description: 'Returns true if a layer with this name exists.' },
      { signature: 'destroy(name: string): boolean', description: 'Removes a layer and all its children from DOM and registry.' },
      { signature: 'resetAll(): void', description: 'Clears all layer content (innerHTML). Does not destroy layers.' },
    ],
    notes: [
      'Layers are positioned absolutely over the RE canvas.',
      'Use z-index to control stacking: HUD (50), overlays (100), modals (200) is a common pattern.',
      'FocusManager automatically passes uiManager to .onEnter() callbacks.',
    ],
  },

  BaseUI: {
    name: 'BaseUI',
    description: 'Abstract base class for UI controllers. Extend it to create UI components that render HTML into a UILayer.',
    category: 'FocusFramework',
    installation: "import { BaseUI } from '../rogue_packages/FocusFramework/BaseUI';",
    methods: [
      { signature: 'constructor(layer: UILayer, focusManager: FocusManager)', description: 'Pass the layer from UILayerManager and the FocusManager instance.' },
      { signature: 'abstract render(payload?: any): void', description: 'Must be implemented. Sets layer.element.innerHTML and attaches listeners. Called from state .onEnter().' },
      { signature: 'protected getBaseHtml(styles?: string, headContent?: string): string', description: 'Helper that wraps CSS/font links in standard HTML boilerplate.' },
    ],
    notes: [
      'Emit events via this.focusManager.events.emit() for state transitions.',
      'Do not hold references to RE components — communicate via the event bus.',
      'The layer reference is available as this.layer throughout the class.',
    ],
  },
};

export const FF_CATEGORIES = [
  { name: 'FocusFramework', description: 'State machine plugin for RogueEngine', classes: ['FocusManager', 'FocusState', 'UILayerManager', 'BaseUI'] },
];

export function formatFFClassInfo(className: string): string {
  const info = FF_CLASS_INFO[className];
  if (!info) return `Unknown FocusFramework class: ${className}`;

  const lines: string[] = [
    `# ${info.name}`,
    ``,
    `**Category:** ${info.category}`,
    `**Description:** ${info.description}`,
    ``,
    `## Installation`,
    `\`\`\`typescript`,
    info.installation,
    `\`\`\``,
  ];

  if (info.properties?.length) {
    lines.push(``, `## Properties`);
    for (const p of info.properties) {
      lines.push(``, `### \`${p.signature}\``, p.description);
    }
  }

  if (info.methods?.length) {
    lines.push(``, `## Methods`);
    for (const m of info.methods) {
      lines.push(``, `### \`${m.signature}\``, m.description);
      if (m.example) lines.push(`\`\`\`typescript`, m.example, `\`\`\``);
    }
  }

  if (info.notes?.length) {
    lines.push(``, `## Notes`);
    for (const n of info.notes) lines.push(`- ${n}`);
  }

  return lines.join('\n');
}
