# RogueEngine MCP Server

A Model Context Protocol (MCP) server that provides tools for working with RogueEngine game development projects. This server enables AI assistants to help you create components, scene controllers, input handlers, and manage your RogueEngine projects.

## Features

This MCP server provides the following tools:

### 1. `create_component`
Create a new RogueEngine component TypeScript file with proper structure and imports.

**Parameters:**
- `name` (string, required): Name of the component class (e.g., PlayerController)
- `directory` (string, required): Directory path where the component should be created
- `isVisual` (boolean, optional): Whether this is a VisualComponent or standard Component (default: false)

### 2. `create_scene_controller`
Create a new RogueEngine SceneController TypeScript file.

**Parameters:**
- `name` (string, required): Name of the scene controller class
- `directory` (string, required): Directory path where the scene controller should be created

### 3. `read_project_structure`
Read and analyze RogueEngine project structure, listing scenes, components, and assets.

**Parameters:**
- `projectPath` (string, required): Path to the RogueEngine project root directory

### 4. `generate_input_handler`
Generate an input handler component for keyboard, mouse, gamepad, or touch input.

**Parameters:**
- `name` (string, required): Name of the input handler component
- `directory` (string, required): Directory path for the component
- `inputType` (string, required): Type of input to handle (keyboard, mouse, gamepad, or touch)

### 5. `add_component_property`
Add a new property decorator to an existing RogueEngine component.

**Parameters:**
- `filePath` (string, required): Path to the component file
- `propertyName` (string, required): Name of the property to add
- `propertyType` (string, required): TypeScript type of the property (e.g., number, string, Vector3)
- `decorator` (string, optional): Decorator to use for the property (default: @prop)

## Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

## Usage

### With Claude Desktop

Add this server to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "rogueengine": {
      "command": "node",
      "args": ["C:\\Projects\\RogueEngineMCP\\dist\\index.js"]
    }
  }
}
```

Replace the path with the actual path to your installation.

### With Other MCP Clients

The server uses stdio transport and can be integrated with any MCP-compatible client. Run:

```bash
node dist/index.js
```

### Visual Studio Code

`.vscode/settings.json`:

```json
{
  "mcp.servers": {
    "rogue-engine": {
      "command": "node",
      "args": ["C:\\Projects\\RogueEngineMCP\\dist\\index.js"],
      "disabled": false
    }
  }
}
```

## Development

### Watch Mode
To automatically rebuild on file changes:
```bash
npm run watch
```

### Project Structure
```
rogueengine-mcp-server/
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Example Usage

Once configured with Claude Desktop, you can ask Claude to:

- "Create a new PlayerController component in the Assets/Components directory"
- "Generate a keyboard input handler called InputManager"
- "Show me the structure of my RogueEngine project at C:/Projects/MyGame"
- "Add a speed property of type number to my PlayerController component"
- "Create a scene controller called GameManager"

## RogueEngine Resources

- [RogueEngine Documentation](https://docs.rogueengine.io)
- [RogueEngine Website](https://rogueengine.io)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.
