# SceneController

The **SceneController** is an abstract class that defines the lifecycle of a Scene and its components. The `Runtime` and `editorRuntime` both extend this class.

Access via `RE.Runtime` (which extends SceneController).

## Properties

### .scene
```typescript
readonly scene: THREE.Scene
```
The THREE.Scene instance currently running.

### .camera
```typescript
camera: THREE.Camera
```
The active camera showing the scene.

### .deltaTime
```typescript
readonly deltaTime: number
```
Seconds elapsed since the last frame. Essential for frame-independent movement.

```typescript
update() {
  // Frame-independent movement
  this.object3d.position.x += this.speed * RE.Runtime.deltaTime;
}
```

### .clock
```typescript
readonly clock: THREE.Clock
```
The THREE.js Clock for time tracking.

### .width / .height
```typescript
readonly width: number
readonly height: number
```
Dimensions of the scene renderer.

### .renderer
```typescript
readonly renderer: THREE.WebGLRenderer
```
The active WebGL renderer.

### .rogueDOMContainer
```typescript
readonly rogueDOMContainer: HTMLElement
```
The HTML element containing the canvas.

### .containerId
```typescript
readonly containerId: string
```
ID of the HTML container element.

### .isRunning
```typescript
readonly isRunning: boolean
```
Whether the animation loop is running.

### .isPaused
```typescript
readonly isPaused: boolean
```
Whether the runtime is paused. When paused, `beforeUpdate()`, `update()`, and `afterUpdate()` don't run.

### .renderFunc
```typescript
renderFunc: () => void
```
The render function called every frame. Override for post-processing effects.

### .defaultRenderFunc
```typescript
readonly defaultRenderFunc: () => void
```
Reference to the default render function.

### .resolution
```typescript
resolution?: number
```
Maximum screen width before scaling pixel ratio. Lower = better performance. Set to `0` or `undefined` for unrestricted.

### .aspectRatio
```typescript
aspectRatio?: number
```
Fixed aspect ratio for the canvas. Set to `0` or `undefined` for unrestricted.

### .useAspectRatio
```typescript
useAspectRatio: boolean
```
Whether to apply the aspect ratio.

## Methods

### .pause()
```typescript
pause(): void
```
Pause the animation loop (update methods stop running).

### .resume()
```typescript
resume(): void
```
Resume the animation loop.

### .togglePause()
```typescript
togglePause(): void
```
Toggle between pause and resume.

```typescript
if (RE.Input.getDown("Pause")) {
  RE.Runtime.togglePause();
}
```

### .setFullscreen()
```typescript
setFullscreen(): void
```
Request browser fullscreen mode.

## Events

### .onPlay()
```typescript
onPlay(callback: () => any): { stop: () => void }
```
Hook into initialization. Returns object with `stop()` to remove listener.

### .onStop()
```typescript
onStop(callback: () => any): { stop: () => void }
```
Hook into shutdown/cleanup. Returns object with `stop()` to remove listener.

```typescript
const listener = RE.Runtime.onStop(() => {
  // Cleanup before scene unloads
  this.disposeResources();
});

// Later, to stop listening:
listener.stop();
```

---

# Runtime

The **Runtime** singleton extends SceneController and represents the playing scene state.

Access via `RE.Runtime`.

When you press play in the editor, Runtime governs the scene behavior. In built projects, Runtime is always active.

## Common Usage

```typescript
import * as RE from 'rogue-engine';

export default class GameManager extends RE.Component {
  update() {
    // Access delta time
    const dt = RE.Runtime.deltaTime;

    // Access scene
    const scene = RE.Runtime.scene;

    // Access camera
    const camera = RE.Runtime.camera;

    // Access renderer
    const renderer = RE.Runtime.renderer;

    // Get elapsed time
    const elapsed = RE.Runtime.clock.getElapsedTime();
  }
}

RE.registerComponent(GameManager);
```
