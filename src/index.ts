#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

// Tool definitions for RogueEngine operations
const TOOLS: Tool[] = [
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
    description: 'Generate an input handler component for keyboard, mouse, gamepad, or touch input',
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
      },
      required: ['name', 'directory', 'inputType'],
    },
  },
  {
    name: 'add_component_property',
    description: 'Add a new property decorator to an existing RogueEngine component',
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
          description: 'TypeScript type of the property (e.g., number, string, Vector3)',
        },
        decorator: {
          type: 'string',
          enum: ['@prop', '@prop()', '@prop("type")'],
          description: 'Decorator to use for the property',
          default: '@prop',
        },
      },
      required: ['filePath', 'propertyName', 'propertyType'],
    },
  },
];

// Generate component template
function generateComponentTemplate(name: string, isVisual: boolean): string {
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

// Generate scene controller template
function generateSceneControllerTemplate(name: string): string {
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

// Generate input handler template
function generateInputHandlerTemplate(name: string, inputType: string): string {
  let inputCode = '';

  switch (inputType) {
    case 'keyboard':
      inputCode = `
  update() {
    // Check keyboard input
    if (RE.Input.keyboard.getKeyDown("Space")) {
      console.log("Space pressed!");
    }

    if (RE.Input.keyboard.getKey("W")) {
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

// Server implementation
const server = new Server(
  {
    name: 'rogueengine-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_component': {
        const { name: componentName, directory, isVisual = false } = args as {
          name: string;
          directory: string;
          isVisual?: boolean;
        };

        const fileName = `${componentName}.ts`;
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
        const { name: controllerName, directory } = args as {
          name: string;
          directory: string;
        };

        const fileName = `${controllerName}.ts`;
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
        const { projectPath } = args as { projectPath: string };

        async function scanDirectory(dir: string, depth = 0): Promise<string[]> {
          const items: string[] = [];
          const entries = await fs.readdir(dir, { withFileTypes: true });

          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(projectPath, fullPath);
            const indent = '  '.repeat(depth);

            if (entry.isDirectory()) {
              items.push(`${indent}📁 ${entry.name}/`);
              if (depth < 3) { // Limit recursion depth
                const subItems = await scanDirectory(fullPath, depth + 1);
                items.push(...subItems);
              }
            } else {
              const ext = path.extname(entry.name);
              let icon = '📄';
              if (ext === '.ts') icon = '📘';
              else if (ext === '.json') icon = '📋';
              else if (['.png', '.jpg', '.jpeg'].includes(ext)) icon = '🖼️';
              else if (['.mp3', '.wav', '.ogg'].includes(ext)) icon = '🔊';

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
        const { name: handlerName, directory, inputType } = args as {
          name: string;
          directory: string;
          inputType: string;
        };

        const fileName = `${handlerName}.ts`;
        const fullPath = path.join(directory, fileName);
        const content = generateInputHandlerTemplate(handlerName, inputType);

        await fs.mkdir(directory, { recursive: true });
        await fs.writeFile(fullPath, content, 'utf-8');

        return {
          content: [
            {
              type: 'text',
              text: `Created ${inputType} input handler: ${fullPath}\n\n${content}`,
            },
          ],
        };
      }

      case 'add_component_property': {
        const { filePath, propertyName, propertyType, decorator = '@prop' } = args as {
          filePath: string;
          propertyName: string;
          propertyType: string;
          decorator?: string;
        };

        const content = await fs.readFile(filePath, 'utf-8');

        // Find the class body to insert the property
        const classMatch = content.match(/class\s+\w+\s+extends\s+RE\.\w+\s*{/);
        if (!classMatch) {
          throw new Error('Could not find class definition in file');
        }

        const insertPosition = classMatch.index! + classMatch[0].length;
        const propertyCode = `\n  ${decorator}\n  ${propertyName}: ${propertyType};\n`;

        const newContent =
          content.slice(0, insertPosition) +
          propertyCode +
          content.slice(insertPosition);

        await fs.writeFile(filePath, newContent, 'utf-8');

        return {
          content: [
            {
              type: 'text',
              text: `Added property '${propertyName}: ${propertyType}' to ${filePath}`,
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
  } catch (error) {
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

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('RogueEngine MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
