# Functions

Global functions available from the Rogue Engine API.

## Component Management

### registerComponent()
```typescript
registerComponent<T extends Component>(ComponentClass: new (...args: any[]) => T): void
```
Register a component class to make it available in the engine.

```typescript
import * as RE from 'rogue-engine';

export default class MyComponent extends RE.Component {
  // ...
}

RE.registerComponent(MyComponent);
```

### addComponent()
```typescript
addComponent(component: Component): void
```
Add a component instance to the engine. Triggers `awake()` and starts the lifecycle.

**Note:** Triggers `onComponentAdded` event.

### removeComponent()
```typescript
removeComponent(component: Component): void
```
Remove a component from the engine. Stops its lifecycle methods.

**Note:** Triggers `onComponentRemoved` event.

### removeComponents()
```typescript
removeComponents(object3d: Object3D, recursive?: boolean): void
```
Remove all components from an Object3D. If `recursive` is true, also removes from children.

### getComponent()
```typescript
getComponent<T extends Component>(
  ComponentClass: new (...args: any[]) => T,
  object3d?: THREE.Object3D,
  inAncestor?: boolean
): T | undefined
```
Get a component of the specified type. If `object3d` provided, searches that object (and ancestors if `inAncestor` is true).

**Prefer using `ComponentClass.get()` when possible.**

```typescript
import { getComponent } from 'rogue-engine';
import { MyComponent } from './MyComponent';

const comp = getComponent(MyComponent, someObject);
```

### getComponents()
```typescript
getComponents<T extends Component>(ComponentClass: new (...args: any[]) => T): T[]
```
Get all components of the specified type in the scene.

### getObjectComponents()
```typescript
getObjectComponents(object3d: Object3D): Component[]
```
Get all components attached to an Object3D.

### getComponentByName()
```typescript
getComponentByName(name: string, object3d?: Object3D, inAncestor?: boolean): Component | undefined
```
Get a component by its class name.

### traverseComponents()
```typescript
traverseComponents(fn: (component: Component, objectUUID: string, index: number) => void): void
```
Run a function for every component in the scene.

---

## Object Management

### setEnabled()
```typescript
setEnabled(object: THREE.Object3D, enabled: boolean): void
```
Enable or disable an object's runtime features (all components become inactive).

```typescript
// Disable an object and all its components
RE.setEnabled(this.enemy, false);

// Re-enable
RE.setEnabled(this.enemy, true);
```

### isEnabled()
```typescript
isEnabled(object: THREE.Object3D): boolean
```
Check if an object is enabled.

```typescript
function toggleEnabled(object: THREE.Object3D) {
  const enabled = RE.isEnabled(object);
  RE.setEnabled(object, !enabled);
}
```

### isActive()
```typescript
isActive(object: THREE.Object3D): boolean
```
Check if an object is active. An object is inactive if itself or any ancestor is disabled.

---

## Picking & Raycasting

### pick()
```typescript
pick(targets: THREE.Object3D[]): THREE.Intersection[]
```
Pick objects under the pointer (mouse or touch). Returns intersection data.

```typescript
update() {
  if (RE.Input.getDown("Select")) {
    const targets = RE.Tags.getWithAll("Selectable");
    const picked = RE.pick(targets)[0]?.object;

    if (picked) {
      this.selectObject(picked);
    }
  }
}
```

### getNearestWithTag()
```typescript
getNearestWithTag(obj: THREE.Object3D, tag: string): THREE.Object3D | undefined
```
Get the nearest ancestor with the specified tag.

```typescript
// Get container of a picked nested object
const picked = RE.pick(targets)[0]?.object;
if (picked) {
  const container = RE.getNearestWithTag(picked, "Selectable");
}
```

### getNearestGroup()
```typescript
getNearestGroup(obj: THREE.Object3D): THREE.Group | undefined
```
Get the nearest ancestor of type THREE.Group.

### getNormalizedDeviceCoordinates()
```typescript
getNormalizedDeviceCoordinates(x: number, y: number): { x: number, y: number }
```
Convert screen coordinates to normalized device coordinates (-1 to 1).

```typescript
const ndc = RE.getNormalizedDeviceCoordinates(RE.Input.mouse.x, RE.Input.mouse.y);
raycaster.setFromCamera(ndc, RE.Runtime.camera);
```

---

## Utilities

### getStaticPath()
```typescript
getStaticPath(path: string): string
```
Get the full path to a static asset. Pass path **without** leading slash.

```typescript
// File at: /Static/icons/myIcon.svg
imgElement.src = RE.getStaticPath("icons/myIcon.svg");

// File at: /Static/data/config.json
const url = RE.getStaticPath("data/config.json");
```

### randomRange()
```typescript
randomRange(min: number, max: number, floor?: boolean): number
```
Generate a random number between min and max. If `floor` is true, returns an integer.

```typescript
// Random float between 0 and 10
const value = RE.randomRange(0, 10);

// Random integer between 1 and 10
const dice = RE.randomRange(1, 10.99, true);
```
