# RogueEngine MCP Server

A comprehensive Model Context Protocol (MCP) server for RogueEngine game development. This server enables AI assistants to understand Rogue Engine APIs, generate components, and scaffold common game development patterns.

## Features

**25 tools** organized into five categories:

| Category | Count | Purpose |
|----------|-------|---------|
| Core Tools | 5 | Component creation, project analysis |
| Documentation | 5 | RE API lookup, decorator reference, search |
| Built-ins & Knowledge | 3 | Built-in components, engine gotchas |
| Scaffolding | 8 | Common gameplay patterns |
| FocusFramework | 4 | State machine plugin — docs + scaffolding |

### Where the API data comes from

The RogueEngine API reference is **generated from the `.d.ts` files the engine
ships**, rather than hand-transcribed from the docs site. That is what keeps it
from going stale: when a new engine version lands, re-run the extractor against
any project and the diff *is* the API changelog.

```bash
# regenerate the API data from a RogueEngine project
npm run extract -- --project /path/to/your/RogueEngine/project

# typecheck + curated-example staleness + server smoke test
npm run verify
```

Hand-written examples and gotchas live in `src/curated/` and are merged on top of
the generated data. The extractor never reads that directory, so regeneration
cannot destroy curation — and `npm run verify` cross-checks every `RE.*`
reference in those examples against the generated API, so an example that drifts
out of date fails loudly instead of silently teaching a removed API.

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
| `decorator` | enum | No | Any engine prop decorator. **Derived from the generated API**, so it always matches the installed engine — run `get_re_decorators` for the current list (53 including the `list.*` / `map.*` forms). Default: `num` |
| `defaultValue` | string | No | Default value for the property |

---

## Documentation Tools

### `get_re_class_info`
Get detailed information about a Rogue Engine class including properties, methods, and examples.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `className` | enum | Yes | Any engine class, singleton or built-in component. **Derived from the generated API** — run `list_re_categories` for the current list |

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

## Built-ins & Knowledge

### `list_builtin_components`
List the engine's built-in components with a one-line summary each — `Character`,
`Weapon`, the `UI*` set, the `Audio*` set, `OrbitCamera`, and the rest.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `group` | enum | No | Restrict to one group: `UI`, `Audio`, `Weapon`, `Camera`, `FX`, `CSS2D`, `HTMLMesh`, `Core` |
| `search` | string | No | Filter by name or description |

### `get_builtin_component`
Full API for one built-in component: properties, methods, statics, and what it
extends. Accepts a free-text name and suggests near matches if it misses.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Component name, e.g. `Character`, `UIButton`, `AudioPlayer3D` |

### `get_re_gotchas`
Engine foot-guns: APIs that compile but are wrong, removed APIs and their
replacements, and performance traps. Worth checking before writing engine code.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | enum | No | `assets`, `performance`, `raycasting`, `models`, `audio`, `lifecycle`, `api`, `batching` |

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

## FocusFramework Tools

FocusFramework is a state machine plugin for RogueEngine that manages UI layers, 3D prefab lifecycles, and state transitions through a fluent builder API. **Source:** [github.com/danbaoren/FocusFramework](https://github.com/danbaoren/FocusFramework)

### `get_focus_class_info`
Get detailed documentation for a FocusFramework class including all methods, properties, and usage notes.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `className` | enum | Yes | One of: `FocusManager`, `FocusState`, `UILayerManager`, `BaseUI` |

### `list_focus_classes`
List all FocusFramework classes with brief descriptions.

*No parameters required.*

### `search_focus_docs`
Search FocusFramework documentation by keyword.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search term (e.g. "push", "UILayer", "transition") |

### `generate_focus_controller`
Generate a starter `AppController.re.ts` that bootstraps FocusManager with named states.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Component class name (e.g. AppController) |
| `directory` | string | Yes | Directory path to create the file |
| `states` | string[] | No | State names to scaffold (default: ["loading","lobby","game"]) |

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
├── tools/
│   └── extract-engine-api.ts             # Reads the engine's .d.ts -> JSON
├── data/
│   └── engine-api.json                   # GENERATED — do not hand-edit
├── scripts/
│   └── verify.mjs                        # Staleness check + server smoke test
├── src/
│   ├── index.ts                          # Main MCP server
│   ├── engine-api.ts                     # Loads generated JSON, merges curated
│   ├── docs-data.ts                      # Public data surface + formatters
│   ├── focusframework-data.ts            # FocusFramework documentation
│   ├── curated/                          # Hand-written — never generated over
│   │   ├── examples.ts                   # Teaching examples + overrides
│   │   ├── gotchas.ts                    # Engine foot-guns
│   │   └── lifecycle.ts                  # Component lifecycle
│   └── templates/
│       ├── input-templates.ts            # Player controller generator
│       ├── gameplay-templates.ts         # Picking, spawner, pool, tag filter
│       ├── manager-templates.ts          # Audio, event, game managers
│       └── focusframework-templates.ts   # AppController scaffold generator
├── dist/                                 # Compiled JavaScript (committed)
├── package.json
├── tsconfig.json
├── tsconfig.tools.json
└── README.md
```

> The old `docs/*.md` and `HTML-DOCS.txt` were removed once the API data became
> generated. They were a January 2026 scrape, read by nothing at runtime, and had
> drifted far enough to document APIs the engine no longer has. Git history still
> has them if you need to look something up.

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

**FocusFramework:**
- "What methods does FocusManager have?"
- "How does FocusState.push() work?"
- "Generate an AppController with states: connecting, lobby, game, pause"

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
- [FocusFramework Plugin](https://github.com/danbaoren/FocusFramework)
- [MCP Protocol](https://modelcontextprotocol.io)

---

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.
