# RogueEngine MCP Server

A comprehensive Model Context Protocol (MCP) server for RogueEngine game development. This server enables AI assistants to understand Rogue Engine APIs, generate components, and scaffold common game development patterns.

## Features

**18 tools** organized into three categories:

| Category | Count | Purpose |
|----------|-------|---------|
| Core Tools | 5 | Component creation, project analysis |
| Documentation | 5 | API lookup, decorator reference, search |
| Scaffolding | 8 | Common gameplay patterns |

---

## Core Tools

### `create_component`
Create a new RogueEngine component TypeScript file with proper structure and imports.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Name of the component class (e.g., PlayerController) |
| `directory` | string | Yes | Directory path where the component should be created |
| `isVisual` | boolean | No | Whether this is a VisualComponent (default: false) |

### `create_scene_controller`
Create a new RogueEngine SceneController TypeScript file.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Name of the scene controller class |
| `directory` | string | Yes | Directory path where the scene controller should be created |

### `read_project_structure`
Read and analyze RogueEngine project structure, listing scenes, components, and assets.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectPath` | string | Yes | Path to the RogueEngine project root directory |

### `generate_input_handler`
Generate an input handler component for keyboard, mouse, gamepad, or touch input.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Name of the input handler component |
| `directory` | string | Yes | Directory path for the component |
| `inputType` | enum | Yes | `keyboard`, `mouse`, `gamepad`, or `touch` |
| `inputStyle` | enum | No | `direct` (device-specific) or `action-based` (device-agnostic, default: direct) |

### `add_component_property`
Add a new property decorator to an existing RogueEngine component.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filePath` | string | Yes | Path to the component file |
| `propertyName` | string | Yes | Name of the property to add |
| `propertyType` | string | Yes | TypeScript type (e.g., number, THREE.Vector3) |
| `decorator` | enum | No | One of: `num`, `text`, `checkbox`, `select`, `vector2`, `vector3`, `color`, `object3d`, `component`, `prefab`, `audio`, `material`, `texture` (default: num) |
| `defaultValue` | string | No | Default value for the property |

---

## Documentation Tools

### `get_re_class_info`
Get detailed information about a Rogue Engine class including properties, methods, and examples.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `className` | enum | Yes | One of: `App`, `Component`, `VisualComponent`, `Input`, `Mouse`, `Keyboard`, `TouchController`, `GamepadController`, `Prefab`, `Runtime`, `SceneController`, `Debug`, `Tags`, `AudioAsset`, `Functions`, `Events` |

### `get_re_decorators`
List all Rogue Engine property decorators (`@RE.props.*`) with syntax and examples.

*No parameters required.*

### `get_re_lifecycle`
Get Component lifecycle methods (awake, start, update, etc.) with descriptions and execution order.

*No parameters required.*

### `search_re_docs`
Search Rogue Engine documentation for a keyword or phrase.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query (e.g., "deltaTime", "prefab instantiate") |

### `list_re_categories`
List all available Rogue Engine documentation categories and their classes.

*No parameters required.*

---

## Scaffolding Tools

### `create_picking_system`
Create a tag-filtered object picking system with raycasting and hover highlighting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Name of the picking system component |
| `directory` | string | Yes | Directory path for the component |
| `selectableTag` | string | No | Tag to filter selectable objects (default: "Selectable") |

### `create_prefab_spawner`
Create a dynamic prefab instantiation component with spawn area and tracking.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Name of the prefab spawner component |
| `directory` | string | Yes | Directory path for the component |
| `spawnOnStart` | boolean | No | Spawn instances on component start (default: false) |

### `create_audio_manager`
Create a centralized audio control component with music and SFX management.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Name of the audio manager component |
| `directory` | string | Yes | Directory path for the component |
| `trackCount` | number | No | Number of audio tracks (1 music + N-1 SFX, default: 3) |

### `create_event_manager`
Create an event listener manager with automatic cleanup on component removal.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Name of the event manager component |
| `directory` | string | Yes | Directory path for the component |

### `create_game_manager`
Create a game state manager with pause, score tracking, and optional scene management.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Name of the game manager component |
| `directory` | string | Yes | Directory path for the component |
| `includeSceneManagement` | boolean | No | Include scene loading methods (default: true) |

### `create_object_pool`
Create a reusable object pooling system for bullets, enemies, effects, etc.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Name of the object pool component |
| `directory` | string | Yes | Directory path for the component |
| `initialSize` | number | No | Initial pool size (default: 10) |
| `autoGrow` | boolean | No | Allow pool to grow when exhausted (default: true) |

### `create_tag_filter`
Create tag-based object filtering utilities with range queries and caching.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Name of the tag filter component |
| `directory` | string | Yes | Directory path for the component |

### `create_player_controller`
Create a player movement controller with optional jump and configurable input style.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Name of the player controller component |
| `directory` | string | Yes | Directory path for the component |
| `includeJump` | boolean | No | Include jump mechanics with gravity (default: true) |
| `inputStyle` | enum | No | `direct` or `action-based` (default: action-based) |

---

## Installation

### Prerequisites
- Node.js 18 or higher
- npm

### Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

---

## Configuration

### Claude Desktop

Add to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "rogueengine": {
      "command": "node",
      "args": ["/path/to/RogueEngineMCP-Full/dist/index.js"]
    }
  }
}
```

### Claude Code

Add to `.claude/settings.json` in your project or globally:

```json
{
  "mcpServers": {
    "rogueengine": {
      "command": "node",
      "args": ["/path/to/RogueEngineMCP-Full/dist/index.js"]
    }
  }
}
```

### Visual Studio Code

Add to `.vscode/settings.json`:

```json
{
  "mcp.servers": {
    "rogueengine": {
      "command": "node",
      "args": ["/path/to/RogueEngineMCP-Full/dist/index.js"],
      "disabled": false
    }
  }
}
```

---

## Project Structure

```
RogueEngineMCP-Full/
├── src/
│   ├── index.ts                    # Main MCP server
│   ├── docs-data.ts                # Embedded RE documentation
│   └── templates/
│       ├── input-templates.ts      # Player controller generator
│       ├── gameplay-templates.ts   # Picking, spawner, pool, tag filter
│       └── manager-templates.ts    # Audio, event, game managers
├── docs/                           # RE documentation markdown
│   ├── App.md
│   ├── Component.md
│   ├── Input.md
│   └── ...
├── dist/                           # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

---

## Example Usage

Once configured, you can ask Claude to:

**Documentation:**
- "What lifecycle methods does a RE Component have?"
- "Show me all the RE property decorators"
- "Search the RE docs for deltaTime"

**Component Creation:**
- "Create a PlayerController component in Assets/Components"
- "Generate an action-based keyboard input handler"
- "Add a prefab property called enemyPrefab to my Spawner component"

**Scaffolding:**
- "Create a picking system for objects tagged 'Selectable'"
- "Generate an object pool for bullets with initial size 20"
- "Create a game manager with scene management"

---

## Development

### Watch Mode
```bash
npm run watch
```

### Rebuild
```bash
npm run build
```

---

## Resources

- [RogueEngine Documentation](https://docs.rogueengine.io)
- [RogueEngine Website](https://rogueengine.io)
- [MCP Protocol](https://modelcontextprotocol.io)

---

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.
