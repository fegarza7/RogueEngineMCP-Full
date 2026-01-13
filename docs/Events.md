# Events

Global event listeners available from the Rogue Engine API.

All event listeners return an object with a `stop()` function to remove the listener.

## Object Events

### onObjectAdded()
```typescript
onObjectAdded(callback: (object: THREE.Object3D, target: THREE.Object3D) => void): { stop: () => void }
```
Triggered when `Object3D.add(object)` is called.

```typescript
import { onObjectAdded } from 'rogue-engine';

const listener = onObjectAdded((object, target) => {
  console.log(`${object.name} added to ${target.name}`);
});

// Later, stop listening:
listener.stop();
```

### onObjectRemoved()
```typescript
onObjectRemoved(callback: (object: THREE.Object3D, target: THREE.Object3D) => void): { stop: () => void }
```
Triggered when `Object3D.remove(object)` is called.

```typescript
import { onObjectRemoved } from 'rogue-engine';

onObjectRemoved((object, target) => {
  console.log(`${object.name} removed from ${target.name}`);
});
```

---

## Component Events

### onComponentAdded()
```typescript
onComponentAdded(callback: (component: Component, target: THREE.Object3D) => void): { stop: () => void }
```
Triggered when `addComponent(component)` is called.

```typescript
import { onComponentAdded } from 'rogue-engine';

onComponentAdded((component, target) => {
  console.log(`${component.name} added to ${target.name}`);
});
```

### onComponentRemoved()
```typescript
onComponentRemoved(callback: (component: Component, target: THREE.Object3D) => void): { stop: () => void }
```
Triggered when `removeComponent(component)` is called.

```typescript
import { onComponentRemoved } from 'rogue-engine';

onComponentRemoved((component, target) => {
  console.log(`${component.name} removed from ${target.name}`);
});
```

---

## Update Loop Events

These events run in both the editor and runtime animation loops.

### onBeforeUpdate()
```typescript
onBeforeUpdate(callback: (sceneController: SceneController) => void): { stop: () => void }
```
Runs during the `beforeUpdate()` phase of every frame.

```typescript
import { onBeforeUpdate } from 'rogue-engine';

onBeforeUpdate((sceneController) => {
  // Runs every frame before component update() methods
});
```

### onUpdate()
```typescript
onUpdate(callback: (sceneController: SceneController) => void): { stop: () => void }
```
Runs during the `update()` phase of every frame.

```typescript
import { onUpdate } from 'rogue-engine';

onUpdate(() => {
  // Runs every frame during update phase
});
```

### onAfterUpdate()
```typescript
onAfterUpdate(callback: (sceneController: SceneController) => void): { stop: () => void }
```
Runs during the `afterUpdate()` phase of every frame.

```typescript
import { onAfterUpdate } from 'rogue-engine';

onAfterUpdate(() => {
  // Runs every frame after component update() methods
});
```

### onNextFrame()
```typescript
onNextFrame(callback: (sceneController: SceneController) => void): void
```
Runs once on the next frame only. Does not return a stop function.

```typescript
import { onNextFrame } from 'rogue-engine';

// Execute something on the next frame
onNextFrame(() => {
  this.initializeAfterFrame();
});
```

---

## Usage Patterns

### Cleanup Pattern
Always stop listeners when no longer needed to prevent memory leaks:

```typescript
export default class MyComponent extends RE.Component {
  private objectAddedListener: { stop: () => void };

  start() {
    this.objectAddedListener = RE.onObjectAdded((obj, target) => {
      this.handleObjectAdded(obj);
    });
  }

  onBeforeRemoved() {
    // Clean up listener
    this.objectAddedListener?.stop();
  }
}
```

### Deferred Initialization
Use `onNextFrame` for initialization that needs other components ready:

```typescript
start() {
  RE.onNextFrame(() => {
    // All components have had their start() called
    this.lateInitialize();
  });
}
```
