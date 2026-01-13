# App

The **App** class handles scene management and provides access to the main application state.

Access via `RE.App`.

## Properties

### .currentScene
```typescript
readonly currentScene: string
```
The name of the currently loaded scene.

### .sceneController
```typescript
readonly sceneController: SceneController
```
The active SceneController instance (usually `RE.Runtime`).

## Methods

### .loadScene()
```typescript
loadScene(sceneName: string): void
```
Load a scene by name.

**Example:**
```typescript
import * as RE from 'rogue-engine';

// Load a new scene
RE.App.loadScene("MainMenu");

// Load scene on button press
if (RE.Input.getDown("Start")) {
  RE.App.loadScene("Level1");
}
```

## Scene Loading Notes

- Scenes are `.rogueScene` files in your Assets folder
- Scene names should match the file name without extension
- Loading a new scene will unload the current scene and all its components
- Use `RE.Runtime.onStop()` to handle cleanup before scene unload
