# Prefab

A **Prefab** is a predefined Object3D stored in a `.roguePrefab` file along with all its components. Prefabs allow you to create reusable game objects.

## Static Properties

### namedPrefabUUIDs
```typescript
static namedPrefabUUIDs: Record<string, string>
```
Map of prefab UUIDs with paths relative to `Assets/Prefabs/` as keys.

## Static Methods

### Prefab.instantiate()
```typescript
static instantiate(name: string): Promise<THREE.Object3D>
```
Asynchronously instantiate a prefab by its "name path" (relative to `Assets/Prefabs/`, without `.roguePrefab` extension).

```typescript
async start() {
  // Location: Assets/Prefabs/MyPrefab.roguePrefab
  const instance = await RE.Prefab.instantiate("MyPrefab");

  // Location: Assets/Prefabs/Enemies/Nemesis.roguePrefab
  const nemesis = await RE.Prefab.instantiate("Enemies/Nemesis");
}
```

### Prefab.fetch()
```typescript
static fetch(name: string): Promise<Prefab>
```
Asynchronously fetch a prefab without instantiating it.

```typescript
async start() {
  const nemesisPrefab = await RE.Prefab.fetch("Enemies/Nemesis");
  const instance = nemesisPrefab.instantiate();
}
```

### Prefab.get()
```typescript
static get(name: string): Prefab
```
Synchronously get a prefab. Only works if the prefab is preloaded in Asset Manager.

```typescript
start() {
  const nemesisPrefab = RE.Prefab.get("Enemies/Nemesis");
  const instance = nemesisPrefab.instantiate();
}
```

## Instance Properties

### .uuid
```typescript
readonly uuid: string
```
Unique identifier for the prefab.

### .path
```typescript
readonly path: string
```
Current path to the prefab file.

### .name
```typescript
readonly name: string
```
Name of the prefab.

## Instance Methods

### .instantiate()
```typescript
instantiate(parent?: THREE.Object3D): THREE.Object3D
```
Instantiate the prefab into the scene. Optionally specify a parent object.

```typescript
@RE.props.prefab()
bulletPrefab: RE.Prefab;

fire() {
  // Instantiate into scene root
  const bullet = this.bulletPrefab.instantiate();
  bullet.position.copy(this.object3d.position);

  // Or instantiate as child of another object
  const child = this.bulletPrefab.instantiate(this.container);
}
```

## Complete Example

```typescript
import * as RE from 'rogue-engine';
import * as THREE from 'three';

export default class EnemySpawner extends RE.Component {
  @RE.props.prefab()
  enemyPrefab: RE.Prefab;

  @RE.props.num(1, 10)
  spawnCount: number = 5;

  @RE.props.object3d()
  spawnArea: THREE.Object3D;

  private enemies: THREE.Object3D[] = [];

  start() {
    this.spawnEnemies();
  }

  spawnEnemies() {
    for (let i = 0; i < this.spawnCount; i++) {
      const enemy = this.enemyPrefab.instantiate();
      enemy.position.set(
        Math.random() * 10 - 5,
        0,
        Math.random() * 10 - 5
      );
      this.enemies.push(enemy);
    }
  }

  // Async version for dynamic loading
  async spawnDynamicEnemy(type: string) {
    const enemy = await RE.Prefab.instantiate(`Enemies/${type}`);
    enemy.position.copy(this.spawnArea.position);
    this.enemies.push(enemy);
  }
}

RE.registerComponent(EnemySpawner);
```
