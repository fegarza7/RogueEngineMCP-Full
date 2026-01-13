# Component

The **Component** class is the base class for game logic in Rogue Engine. Components are scripts that can be attached to `THREE.Object3D` instances in a scene.

## Registration

Components must be registered to be usable in the editor:

```typescript
import * as RE from 'rogue-engine';

export default class MyComponent extends RE.Component {
  // Component implementation
}

RE.registerComponent(MyComponent);
```

## Properties

### .object3d
```typescript
readonly object3d: THREE.Object3D
```
The `Object3D` to which this component is attached.

### .name
```typescript
name: string
```
The name of this component.

### .initialized
```typescript
readonly initialized: boolean
```
A flag indicating if the component has been initialized.

## Lifecycle Methods

Components have a defined lifecycle that controls when methods are called:

| Method | When Called |
|--------|-------------|
| `awake()` | Called once before the first frame, before `start()`. Use for initialization that doesn't depend on other components. |
| `start()` | Called once when the component is ready, after `awake()`. Use for initialization that may depend on other components. |
| `beforeUpdate()` | Called every frame before `update()`. |
| `update()` | Called every frame. Primary game loop logic goes here. |
| `afterUpdate()` | Called every frame after `update()`. |
| `onBeforeRemoved()` | Called just before the component is removed. Use for cleanup. |

### Lifecycle Flow
```
awake() → start() → [beforeUpdate() → update() → afterUpdate()] (repeats) → onBeforeRemoved()
```

### Example
```typescript
import * as RE from 'rogue-engine';

export default class MyComponent extends RE.Component {
  awake() {
    // Initialize variables, setup state
  }

  start() {
    // Setup that depends on other components being ready
  }

  update() {
    // Frame-by-frame logic
    // Use RE.Runtime.deltaTime for frame-independent movement
  }

  onBeforeRemoved() {
    // Cleanup: remove event listeners, dispose resources
  }
}

RE.registerComponent(MyComponent);
```

## Static Methods

### ComponentClass.get()
```typescript
static get(object?: THREE.Object3D, inAncestor?: boolean): T | undefined
```
Retrieves an instance of this component type. If `object` is provided, searches on that object (and ancestors if `inAncestor` is true). Otherwise returns the first instance found.

### ComponentClass.getAll()
```typescript
static getAll(): T[]
```
Retrieves all instances of this component type in the scene.

### ComponentClass.require()
```typescript
@ComponentClass.require()
```
Decorator for dependency injection. Gets a sibling component of the specified type.

**Example:**
```typescript
import * as RE from 'rogue-engine';
import RapierBody from '@RE/RogueEngine/rogue-rapier/Components/RapierBody.re';

export default class MyPhysicsComponent extends RE.Component {
  @RapierBody.require()
  body: RapierBody;

  start() {
    // this.body is automatically populated with the RapierBody on same object
  }
}

RE.registerComponent(MyPhysicsComponent);
```

---

# Property Decorators

Property decorators expose component properties to the Rogue Engine Inspector, allowing visual editing.

## Numeric Properties

### @RE.props.num()
```typescript
@RE.props.num(min?: number, max?: number, step?: number)
```
Exposes a numeric property with optional min/max/step constraints.

```typescript
@RE.props.num(0, 100, 1)
speed: number = 10;

@RE.props.num()
health: number = 100;
```

## Text Properties

### @RE.props.text()
```typescript
@RE.props.text()
```
Exposes a string property.

```typescript
@RE.props.text()
playerName: string = "Player";
```

## Boolean Properties

### @RE.props.checkbox()
```typescript
@RE.props.checkbox()
```
Exposes a boolean property as a checkbox.

```typescript
@RE.props.checkbox()
isEnabled: boolean = true;
```

## Selection Properties

### @RE.props.select()
```typescript
@RE.props.select()
```
Exposes a dropdown selection.

```typescript
@RE.props.select()
mode: number = 0;
static modeOptions = ["Easy", "Medium", "Hard"];
```

## Vector Properties

### @RE.props.vector2()
```typescript
@RE.props.vector2()
```
Exposes a Vector2 property.

```typescript
@RE.props.vector2()
offset: THREE.Vector2 = new THREE.Vector2();
```

### @RE.props.vector3()
```typescript
@RE.props.vector3()
```
Exposes a Vector3 property.

```typescript
@RE.props.vector3()
targetPosition: THREE.Vector3 = new THREE.Vector3();
```

## Color Properties

### @RE.props.color()
```typescript
@RE.props.color()
```
Exposes a color property with color picker.

```typescript
@RE.props.color()
tint: THREE.Color = new THREE.Color(0xffffff);
```

## Reference Properties

### @RE.props.object3d()
```typescript
@RE.props.object3d()
```
Reference to a scene object.

```typescript
@RE.props.object3d()
target: THREE.Object3D;
```

### @RE.props.component()
```typescript
@RE.props.component(ComponentClass)
```
Reference to another component.

```typescript
@RE.props.component(PlayerController)
player: PlayerController;
```

### @RE.props.prefab()
```typescript
@RE.props.prefab()
```
Reference to a prefab asset.

```typescript
@RE.props.prefab()
bulletPrefab: RE.Prefab;
```

### @RE.props.audio()
```typescript
@RE.props.audio()
```
Reference to an audio asset.

```typescript
@RE.props.audio()
shootSound: RE.AudioAsset;
```

### @RE.props.material()
```typescript
@RE.props.material()
```
Reference to a material.

```typescript
@RE.props.material()
highlightMaterial: THREE.Material;
```

### @RE.props.texture()
```typescript
@RE.props.texture()
```
Reference to a texture.

```typescript
@RE.props.texture()
diffuseMap: THREE.Texture;
```

---

## Complete Component Example

```typescript
import * as RE from 'rogue-engine';
import * as THREE from 'three';

export default class PlayerController extends RE.Component {
  // Numeric properties
  @RE.props.num(0, 20, 0.5)
  speed: number = 5;

  @RE.props.num()
  jumpForce: number = 10;

  // Boolean
  @RE.props.checkbox()
  canJump: boolean = true;

  // References
  @RE.props.object3d()
  cameraTarget: THREE.Object3D;

  @RE.props.prefab()
  bulletPrefab: RE.Prefab;

  @RE.props.audio()
  jumpSound: RE.AudioAsset;

  // Private state
  private velocity = new THREE.Vector3();

  awake() {
    this.velocity.set(0, 0, 0);
  }

  start() {
    console.log("PlayerController started on:", this.object3d.name);
  }

  update() {
    const { x, y } = RE.Input.getAxes("Move");

    this.object3d.position.x += x * this.speed * RE.Runtime.deltaTime;
    this.object3d.position.z += y * this.speed * RE.Runtime.deltaTime;

    if (this.canJump && RE.Input.getDown("Jump")) {
      this.jump();
    }
  }

  private jump() {
    this.velocity.y = this.jumpForce;
    this.jumpSound?.play();
  }

  onBeforeRemoved() {
    // Cleanup
  }
}

RE.registerComponent(PlayerController);
```
