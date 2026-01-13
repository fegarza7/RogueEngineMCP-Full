#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs/promises';
import * as path from 'path';
// Import documentation data
import { formatClassInfo, formatDecorators, formatLifecycle, formatCategories, formatSearchResults, searchDocs, } from './docs-data.js';
// Import template generators
import { generatePlayerControllerTemplate } from './templates/input-templates.js';
import { generatePickingSystemTemplate, generatePrefabSpawnerTemplate, generateObjectPoolTemplate, generateTagFilterTemplate, } from './templates/gameplay-templates.js';
import { generateAudioManagerTemplate, generateEventManagerTemplate, generateGameManagerTemplate, } from './templates/manager-templates.js';
// ============================================================================
// TOOL DEFINITIONS (18 Total)
// ============================================================================
const TOOLS = [
    // -------------------------------------------------------------------------
    // CORE TOOLS (5)
    // -------------------------------------------------------------------------
    {
        name: 'create_component',
        description: 'Create a new RogueEngine component TypeScript file with proper structure and imports',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the component class (e.g., PlayerController)',
                },
                directory: {
                    type: 'string',
                    description: 'Directory path where the component should be created (relative to project root)',
                },
                isVisual: {
                    type: 'boolean',
                    description: 'Whether this is a VisualComponent (has visual representation) or standard Component',
                    default: false,
                },
            },
            required: ['name', 'directory'],
        },
    },
    {
        name: 'create_scene_controller',
        description: 'Create a new RogueEngine SceneController TypeScript file',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the scene controller class',
                },
                directory: {
                    type: 'string',
                    description: 'Directory path where the scene controller should be created',
                },
            },
            required: ['name', 'directory'],
        },
    },
    {
        name: 'read_project_structure',
        description: 'Read and analyze RogueEngine project structure, listing scenes, components, and assets',
        inputSchema: {
            type: 'object',
            properties: {
                projectPath: {
                    type: 'string',
                    description: 'Path to the RogueEngine project root directory',
                },
            },
            required: ['projectPath'],
        },
    },
    {
        name: 'generate_input_handler',
        description: 'Generate an input handler component for keyboard, mouse, gamepad, or touch input. Supports direct or action-based input styles.',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the input handler component',
                },
                directory: {
                    type: 'string',
                    description: 'Directory path for the component',
                },
                inputType: {
                    type: 'string',
                    enum: ['keyboard', 'mouse', 'gamepad', 'touch'],
                    description: 'Type of input to handle',
                },
                inputStyle: {
                    type: 'string',
                    enum: ['direct', 'action-based'],
                    description: 'Input style: direct (device-specific) or action-based (device-agnostic)',
                    default: 'direct',
                },
            },
            required: ['name', 'directory', 'inputType'],
        },
    },
    {
        name: 'add_component_property',
        description: 'Add a new property decorator to an existing RogueEngine component. Supports all @RE.props.* decorators.',
        inputSchema: {
            type: 'object',
            properties: {
                filePath: {
                    type: 'string',
                    description: 'Path to the component file',
                },
                propertyName: {
                    type: 'string',
                    description: 'Name of the property to add',
                },
                propertyType: {
                    type: 'string',
                    description: 'TypeScript type of the property (e.g., number, string, THREE.Vector3)',
                },
                decorator: {
                    type: 'string',
                    enum: ['num', 'text', 'checkbox', 'select', 'vector2', 'vector3', 'color', 'object3d', 'component', 'prefab', 'audio', 'material', 'texture'],
                    description: 'RE property decorator to use',
                    default: 'num',
                },
                defaultValue: {
                    type: 'string',
                    description: 'Default value for the property (optional)',
                },
            },
            required: ['filePath', 'propertyName', 'propertyType'],
        },
    },
    // -------------------------------------------------------------------------
    // DOCUMENTATION TOOLS (5)
    // -------------------------------------------------------------------------
    {
        name: 'get_re_class_info',
        description: 'Get detailed information about a Rogue Engine class including properties, methods, and examples',
        inputSchema: {
            type: 'object',
            properties: {
                className: {
                    type: 'string',
                    enum: ['App', 'Component', 'VisualComponent', 'Input', 'Mouse', 'Keyboard', 'TouchController', 'GamepadController', 'Prefab', 'Runtime', 'SceneController', 'Debug', 'Tags', 'AudioAsset', 'Functions', 'Events'],
                    description: 'Name of the RE class to get info about',
                },
            },
            required: ['className'],
        },
    },
    {
        name: 'get_re_decorators',
        description: 'List all Rogue Engine property decorators (@RE.props.*) with syntax and examples',
        inputSchema: {
            type: 'object',
            properties: {},
            required: [],
        },
    },
    {
        name: 'get_re_lifecycle',
        description: 'Get Component lifecycle methods (awake, start, update, etc.) with descriptions and execution order',
        inputSchema: {
            type: 'object',
            properties: {},
            required: [],
        },
    },
    {
        name: 'search_re_docs',
        description: 'Search Rogue Engine documentation for a keyword or phrase',
        inputSchema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Search query (e.g., "deltaTime", "prefab instantiate")',
                },
            },
            required: ['query'],
        },
    },
    {
        name: 'list_re_categories',
        description: 'List all available Rogue Engine documentation categories and their classes',
        inputSchema: {
            type: 'object',
            properties: {},
            required: [],
        },
    },
    // -------------------------------------------------------------------------
    // SCAFFOLDING TOOLS (8)
    // -------------------------------------------------------------------------
    {
        name: 'create_picking_system',
        description: 'Create a tag-filtered object picking system with raycasting and hover highlighting',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the picking system component',
                },
                directory: {
                    type: 'string',
                    description: 'Directory path for the component',
                },
                selectableTag: {
                    type: 'string',
                    description: 'Tag to filter selectable objects (default: "Selectable")',
                    default: 'Selectable',
                },
            },
            required: ['name', 'directory'],
        },
    },
    {
        name: 'create_prefab_spawner',
        description: 'Create a dynamic prefab instantiation component with spawn area and tracking',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the prefab spawner component',
                },
                directory: {
                    type: 'string',
                    description: 'Directory path for the component',
                },
                spawnOnStart: {
                    type: 'boolean',
                    description: 'Whether to spawn instances on component start',
                    default: false,
                },
            },
            required: ['name', 'directory'],
        },
    },
    {
        name: 'create_audio_manager',
        description: 'Create a centralized audio control component with music and SFX management',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the audio manager component',
                },
                directory: {
                    type: 'string',
                    description: 'Directory path for the component',
                },
                trackCount: {
                    type: 'number',
                    description: 'Number of audio tracks (1 music + N-1 SFX)',
                    default: 3,
                },
            },
            required: ['name', 'directory'],
        },
    },
    {
        name: 'create_event_manager',
        description: 'Create an event listener manager with automatic cleanup on component removal',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the event manager component',
                },
                directory: {
                    type: 'string',
                    description: 'Directory path for the component',
                },
            },
            required: ['name', 'directory'],
        },
    },
    {
        name: 'create_game_manager',
        description: 'Create a game state manager with pause, score tracking, and optional scene management',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the game manager component',
                },
                directory: {
                    type: 'string',
                    description: 'Directory path for the component',
                },
                includeSceneManagement: {
                    type: 'boolean',
                    description: 'Include scene loading methods',
                    default: true,
                },
            },
            required: ['name', 'directory'],
        },
    },
    {
        name: 'create_object_pool',
        description: 'Create a reusable object pooling system for bullets, enemies, effects, etc.',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the object pool component',
                },
                directory: {
                    type: 'string',
                    description: 'Directory path for the component',
                },
                initialSize: {
                    type: 'number',
                    description: 'Initial pool size',
                    default: 10,
                },
                autoGrow: {
                    type: 'boolean',
                    description: 'Allow pool to grow when exhausted',
                    default: true,
                },
            },
            required: ['name', 'directory'],
        },
    },
    {
        name: 'create_tag_filter',
        description: 'Create tag-based object filtering utilities with range queries and caching',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the tag filter component',
                },
                directory: {
                    type: 'string',
                    description: 'Directory path for the component',
                },
            },
            required: ['name', 'directory'],
        },
    },
    {
        name: 'create_player_controller',
        description: 'Create a player movement controller with optional jump and configurable input style',
        inputSchema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Name of the player controller component',
                },
                directory: {
                    type: 'string',
                    description: 'Directory path for the component',
                },
                includeJump: {
                    type: 'boolean',
                    description: 'Include jump mechanics with gravity',
                    default: true,
                },
                inputStyle: {
                    type: 'string',
                    enum: ['direct', 'action-based'],
                    description: 'Input style: direct or action-based',
                    default: 'action-based',
                },
            },
            required: ['name', 'directory'],
        },
    },
];
// ============================================================================
// TEMPLATE GENERATORS (Core Tools)
// ============================================================================
function generateComponentTemplate(name, isVisual) {
    const baseClass = isVisual ? 'VisualComponent' : 'Component';
    return `import * as RE from 'rogue-engine';

export default class ${name} extends RE.${baseClass} {

  @RE.props.num()
  exampleProperty: number = 0;

  awake() {
    // Called when the component is first initialized
  }

  start() {
    // Called on the first frame
  }

  update() {
    // Called every frame
  }

  onBeforeRemoved() {
    // Called before the component is removed
  }
}

RE.registerComponent(${name});
`;
}
function generateSceneControllerTemplate(name) {
    return `import * as RE from 'rogue-engine';

export default class ${name} extends RE.SceneController {

  init() {
    // Called when the scene is initialized
  }

  onStart() {
    // Called when the scene starts
  }

  onUpdate() {
    // Called every frame
  }

  onStop() {
    // Called when the scene stops
  }
}

RE.registerSceneController(${name});
`;
}
function generateInputHandlerTemplate(name, inputType, inputStyle = 'direct') {
    if (inputStyle === 'action-based') {
        return `import * as RE from 'rogue-engine';

// Action-based input handler - device agnostic
export default class ${name} extends RE.Component {

  // Action mappings
  private actions = new Map<string, () => boolean>();

  awake() {
    this.setupActions();
  }

  private setupActions() {
    // Define actions that can be triggered by multiple input sources
    this.actions.set('jump', () =>
      RE.Input.keyboard.getKeyDown('Space') ||
      RE.Input.gamepad.getButtonDown(0)
    );

    this.actions.set('attack', () =>
      RE.Input.mouse.getButtonDown(0) ||
      RE.Input.gamepad.getButtonDown(2)
    );

    this.actions.set('interact', () =>
      RE.Input.keyboard.getKeyDown('KeyE') ||
      RE.Input.gamepad.getButtonDown(1)
    );
  }

  // Check if an action is triggered
  isActionTriggered(actionName: string): boolean {
    const action = this.actions.get(actionName);
    return action ? action() : false;
  }

  // Get movement vector (normalized, device-agnostic)
  getMovementVector(): { x: number, y: number } {
    let x = 0, y = 0;

    // Keyboard input
    if (RE.Input.keyboard.getKey('KeyW') || RE.Input.keyboard.getKey('ArrowUp')) y += 1;
    if (RE.Input.keyboard.getKey('KeyS') || RE.Input.keyboard.getKey('ArrowDown')) y -= 1;
    if (RE.Input.keyboard.getKey('KeyA') || RE.Input.keyboard.getKey('ArrowLeft')) x -= 1;
    if (RE.Input.keyboard.getKey('KeyD') || RE.Input.keyboard.getKey('ArrowRight')) x += 1;

    // Gamepad input (overrides if significant)
    const gx = RE.Input.gamepad.getAxis(0);
    const gy = RE.Input.gamepad.getAxis(1);
    if (Math.abs(gx) > 0.1 || Math.abs(gy) > 0.1) {
      x = gx;
      y = -gy; // Invert Y for standard game coordinates
    }

    // Normalize
    const length = Math.sqrt(x * x + y * y);
    if (length > 1) {
      x /= length;
      y /= length;
    }

    return { x, y };
  }

  update() {
    // Example usage
    if (this.isActionTriggered('jump')) {
      console.log('Jump action triggered!');
    }

    const movement = this.getMovementVector();
    if (movement.x !== 0 || movement.y !== 0) {
      console.log('Movement:', movement);
    }
  }
}

RE.registerComponent(${name});
`;
    }
    // Direct input style (original)
    let inputCode = '';
    switch (inputType) {
        case 'keyboard':
            inputCode = `
  update() {
    // Check keyboard input
    if (RE.Input.keyboard.getKeyDown("Space")) {
      console.log("Space pressed!");
    }

    if (RE.Input.keyboard.getKey("KeyW")) {
      console.log("W is being held");
    }

    if (RE.Input.keyboard.getKeyUp("Escape")) {
      console.log("Escape released!");
    }
  }`;
            break;
        case 'mouse':
            inputCode = `
  update() {
    // Check mouse input
    if (RE.Input.mouse.getButtonDown(0)) {
      console.log("Left mouse button pressed");
      console.log("Mouse position:", RE.Input.mouse.x, RE.Input.mouse.y);
    }

    if (RE.Input.mouse.getButton(1)) {
      console.log("Right mouse button held");
    }

    const scrollDelta = RE.Input.mouse.wheel;
    if (scrollDelta !== 0) {
      console.log("Mouse wheel:", scrollDelta);
    }
  }`;
            break;
        case 'gamepad':
            inputCode = `
  update() {
    // Check gamepad input
    const gamepad = RE.Input.gamepad;

    if (gamepad.getButtonDown(0)) {
      console.log("Gamepad button 0 pressed");
    }

    const leftStickX = gamepad.getAxis(0);
    const leftStickY = gamepad.getAxis(1);

    if (Math.abs(leftStickX) > 0.1 || Math.abs(leftStickY) > 0.1) {
      console.log("Left stick:", leftStickX, leftStickY);
    }
  }`;
            break;
        case 'touch':
            inputCode = `
  update() {
    // Check touch input
    const touches = RE.Input.touch.touches;

    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      console.log(\`Touch \${i}: x=\${touch.x}, y=\${touch.y}\`);
    }

    if (RE.Input.touch.touchStart) {
      console.log("Touch started");
    }

    if (RE.Input.touch.touchEnd) {
      console.log("Touch ended");
    }
  }`;
            break;
    }
    return `import * as RE from 'rogue-engine';

export default class ${name} extends RE.Component {

  awake() {
    // Initialize input handler
  }

  start() {
    // Setup
  }
${inputCode}

  onBeforeRemoved() {
    // Cleanup
  }
}

RE.registerComponent(${name});
`;
}
// Decorator mappings for add_component_property
const DECORATOR_MAP = {
    num: '@RE.props.num()',
    text: '@RE.props.text()',
    checkbox: '@RE.props.checkbox()',
    select: '@RE.props.select()',
    vector2: '@RE.props.vector2()',
    vector3: '@RE.props.vector3()',
    color: '@RE.props.color()',
    object3d: '@RE.props.object3d()',
    component: '@RE.props.component()',
    prefab: '@RE.props.prefab()',
    audio: '@RE.props.audio()',
    material: '@RE.props.material()',
    texture: '@RE.props.texture()',
};
// ============================================================================
// SERVER IMPLEMENTATION
// ============================================================================
const server = new Server({
    name: 'rogueengine-mcp-server',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            // -----------------------------------------------------------------
            // CORE TOOLS
            // -----------------------------------------------------------------
            case 'create_component': {
                const { name: componentName, directory, isVisual = false } = args;
                const fileName = `${componentName}.re.ts`;
                const fullPath = path.join(directory, fileName);
                const content = generateComponentTemplate(componentName, isVisual);
                await fs.mkdir(directory, { recursive: true });
                await fs.writeFile(fullPath, content, 'utf-8');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Created ${isVisual ? 'Visual' : ''} Component: ${fullPath}\n\n${content}`,
                        },
                    ],
                };
            }
            case 'create_scene_controller': {
                const { name: controllerName, directory } = args;
                const fileName = `${controllerName}.re.ts`;
                const fullPath = path.join(directory, fileName);
                const content = generateSceneControllerTemplate(controllerName);
                await fs.mkdir(directory, { recursive: true });
                await fs.writeFile(fullPath, content, 'utf-8');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Created SceneController: ${fullPath}\n\n${content}`,
                        },
                    ],
                };
            }
            case 'read_project_structure': {
                const { projectPath } = args;
                async function scanDirectory(dir, depth = 0) {
                    const items = [];
                    const entries = await fs.readdir(dir, { withFileTypes: true });
                    for (const entry of entries) {
                        const fullPath = path.join(dir, entry.name);
                        const indent = '  '.repeat(depth);
                        if (entry.isDirectory()) {
                            if (entry.name === 'node_modules' || entry.name === '.git')
                                continue;
                            items.push(`${indent}📁 ${entry.name}/`);
                            if (depth < 3) {
                                const subItems = await scanDirectory(fullPath, depth + 1);
                                items.push(...subItems);
                            }
                        }
                        else {
                            const ext = path.extname(entry.name);
                            let icon = '📄';
                            if (ext === '.ts')
                                icon = '📘';
                            else if (ext === '.json')
                                icon = '📋';
                            else if (ext === '.rogueScene')
                                icon = '🎬';
                            else if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext))
                                icon = '🖼️';
                            else if (['.mp3', '.wav', '.ogg'].includes(ext))
                                icon = '🔊';
                            else if (['.glb', '.gltf', '.fbx'].includes(ext))
                                icon = '🎨';
                            items.push(`${indent}${icon} ${entry.name}`);
                        }
                    }
                    return items;
                }
                const structure = await scanDirectory(projectPath);
                const structureText = structure.join('\n');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `RogueEngine Project Structure:\n${projectPath}\n\n${structureText}`,
                        },
                    ],
                };
            }
            case 'generate_input_handler': {
                const { name: handlerName, directory, inputType, inputStyle = 'direct' } = args;
                const fileName = `${handlerName}.re.ts`;
                const fullPath = path.join(directory, fileName);
                const content = generateInputHandlerTemplate(handlerName, inputType, inputStyle);
                await fs.mkdir(directory, { recursive: true });
                await fs.writeFile(fullPath, content, 'utf-8');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Created ${inputStyle} ${inputType} input handler: ${fullPath}\n\n${content}`,
                        },
                    ],
                };
            }
            case 'add_component_property': {
                const { filePath, propertyName, propertyType, decorator = 'num', defaultValue } = args;
                const content = await fs.readFile(filePath, 'utf-8');
                const decoratorCode = DECORATOR_MAP[decorator] || '@RE.props.num()';
                const classMatch = content.match(/class\s+\w+\s+extends\s+RE\.\w+\s*{/);
                if (!classMatch) {
                    throw new Error('Could not find class definition in file');
                }
                const insertPosition = classMatch.index + classMatch[0].length;
                const valueStr = defaultValue ? ` = ${defaultValue}` : '';
                const propertyCode = `\n\n  ${decoratorCode}\n  ${propertyName}: ${propertyType}${valueStr};`;
                const newContent = content.slice(0, insertPosition) +
                    propertyCode +
                    content.slice(insertPosition);
                await fs.writeFile(filePath, newContent, 'utf-8');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Added property '${propertyName}: ${propertyType}' with ${decoratorCode} to ${filePath}`,
                        },
                    ],
                };
            }
            // -----------------------------------------------------------------
            // DOCUMENTATION TOOLS
            // -----------------------------------------------------------------
            case 'get_re_class_info': {
                const { className } = args;
                const info = formatClassInfo(className);
                return {
                    content: [
                        {
                            type: 'text',
                            text: info,
                        },
                    ],
                };
            }
            case 'get_re_decorators': {
                const decorators = formatDecorators();
                return {
                    content: [
                        {
                            type: 'text',
                            text: decorators,
                        },
                    ],
                };
            }
            case 'get_re_lifecycle': {
                const lifecycle = formatLifecycle();
                return {
                    content: [
                        {
                            type: 'text',
                            text: lifecycle,
                        },
                    ],
                };
            }
            case 'search_re_docs': {
                const { query } = args;
                const results = searchDocs(query);
                const formatted = formatSearchResults(results);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `# Search: "${query}"\n\n${formatted}`,
                        },
                    ],
                };
            }
            case 'list_re_categories': {
                const categories = formatCategories();
                return {
                    content: [
                        {
                            type: 'text',
                            text: categories,
                        },
                    ],
                };
            }
            // -----------------------------------------------------------------
            // SCAFFOLDING TOOLS
            // -----------------------------------------------------------------
            case 'create_picking_system': {
                const { name: componentName, directory, selectableTag = 'Selectable' } = args;
                const fileName = `${componentName}.re.ts`;
                const fullPath = path.join(directory, fileName);
                const content = generatePickingSystemTemplate({ name: componentName, selectableTag });
                await fs.mkdir(directory, { recursive: true });
                await fs.writeFile(fullPath, content, 'utf-8');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Created picking system: ${fullPath}\n\n${content}`,
                        },
                    ],
                };
            }
            case 'create_prefab_spawner': {
                const { name: componentName, directory, spawnOnStart = false } = args;
                const fileName = `${componentName}.re.ts`;
                const fullPath = path.join(directory, fileName);
                const content = generatePrefabSpawnerTemplate({ name: componentName, spawnOnStart });
                await fs.mkdir(directory, { recursive: true });
                await fs.writeFile(fullPath, content, 'utf-8');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Created prefab spawner: ${fullPath}\n\n${content}`,
                        },
                    ],
                };
            }
            case 'create_audio_manager': {
                const { name: componentName, directory, trackCount = 3 } = args;
                const fileName = `${componentName}.re.ts`;
                const fullPath = path.join(directory, fileName);
                const content = generateAudioManagerTemplate({ name: componentName, trackCount });
                await fs.mkdir(directory, { recursive: true });
                await fs.writeFile(fullPath, content, 'utf-8');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Created audio manager: ${fullPath}\n\n${content}`,
                        },
                    ],
                };
            }
            case 'create_event_manager': {
                const { name: componentName, directory } = args;
                const fileName = `${componentName}.re.ts`;
                const fullPath = path.join(directory, fileName);
                const content = generateEventManagerTemplate({ name: componentName });
                await fs.mkdir(directory, { recursive: true });
                await fs.writeFile(fullPath, content, 'utf-8');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Created event manager: ${fullPath}\n\n${content}`,
                        },
                    ],
                };
            }
            case 'create_game_manager': {
                const { name: componentName, directory, includeSceneManagement = true } = args;
                const fileName = `${componentName}.re.ts`;
                const fullPath = path.join(directory, fileName);
                const content = generateGameManagerTemplate({ name: componentName, includeSceneManagement });
                await fs.mkdir(directory, { recursive: true });
                await fs.writeFile(fullPath, content, 'utf-8');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Created game manager: ${fullPath}\n\n${content}`,
                        },
                    ],
                };
            }
            case 'create_object_pool': {
                const { name: componentName, directory, initialSize = 10, autoGrow = true } = args;
                const fileName = `${componentName}.re.ts`;
                const fullPath = path.join(directory, fileName);
                const content = generateObjectPoolTemplate({ name: componentName, initialSize, autoGrow });
                await fs.mkdir(directory, { recursive: true });
                await fs.writeFile(fullPath, content, 'utf-8');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Created object pool: ${fullPath}\n\n${content}`,
                        },
                    ],
                };
            }
            case 'create_tag_filter': {
                const { name: componentName, directory } = args;
                const fileName = `${componentName}.re.ts`;
                const fullPath = path.join(directory, fileName);
                const content = generateTagFilterTemplate({ name: componentName });
                await fs.mkdir(directory, { recursive: true });
                await fs.writeFile(fullPath, content, 'utf-8');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Created tag filter: ${fullPath}\n\n${content}`,
                        },
                    ],
                };
            }
            case 'create_player_controller': {
                const { name: componentName, directory, includeJump = true, inputStyle = 'action-based' } = args;
                const fileName = `${componentName}.re.ts`;
                const fullPath = path.join(directory, fileName);
                const content = generatePlayerControllerTemplate({ name: componentName, includeJump, inputStyle: inputStyle });
                await fs.mkdir(directory, { recursive: true });
                await fs.writeFile(fullPath, content, 'utf-8');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Created player controller: ${fullPath}\n\n${content}`,
                        },
                    ],
                };
            }
            default:
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Unknown tool: ${name}`,
                        },
                    ],
                    isError: true,
                };
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
});
// ============================================================================
// START SERVER
// ============================================================================
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('RogueEngine MCP server running on stdio');
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map