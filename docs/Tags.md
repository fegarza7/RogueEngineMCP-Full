# Tags

The **Tags** class manages object tagging for classification and querying.

Access via `RE.Tags`.

## Overview

Tags provide a simple way to classify objects. An object can have multiple tags.

**Example use cases:**
- Tag objects as "enemy", "player", "collectible"
- Filter pickable objects with "Selectable" tag
- Combine tags: "human" + "player" = human players

## Methods

### getTags()
```typescript
getTags(): string[]
```
Get all registered tags.

```typescript
const allTags = RE.Tags.getTags();
// ["enemy", "player", "collectible", ...]
```

### getObjects()
```typescript
getObjects(tag: string): THREE.Object3D[]
```
Get all objects with a specific tag.

```typescript
const enemies = RE.Tags.getObjects("enemy");
```

### getWithAll()
```typescript
getWithAll(...tags: string[]): THREE.Object3D[]
```
Get objects that have **all** of the specified tags.

```typescript
// Get objects that are both "human" AND "player"
const humanPlayers = RE.Tags.getWithAll("human", "player");
```

### getWithAny()
```typescript
getWithAny(...tags: string[]): THREE.Object3D[]
```
Get objects that have **any** of the specified tags.

```typescript
// Get objects that are either "enemy" OR "obstacle"
const threats = RE.Tags.getWithAny("enemy", "obstacle");
```

### hasAny()
```typescript
hasAny(object: THREE.Object3D, ...tags: string[]): boolean
```
Check if an object has any of the specified tags.

```typescript
if (RE.Tags.hasAny(target, "enemy", "destructible")) {
  this.attack(target);
}
```

### hasAll()
```typescript
hasAll(object: THREE.Object3D, ...tags: string[]): boolean
```
Check if an object has all of the specified tags.

```typescript
if (RE.Tags.hasAll(target, "human", "player")) {
  this.greetPlayer(target);
}
```

### hasNone()
```typescript
hasNone(object: THREE.Object3D, ...tags: string[]): boolean
```
Check if an object has none of the specified tags.

```typescript
if (RE.Tags.hasNone(target, "invincible", "shield")) {
  this.applyDamage(target);
}
```

### isMissingAll()
```typescript
isMissingAll(object: THREE.Object3D, ...tags: string[]): boolean
```
Check if an object is missing all of the specified tags.

### get()
```typescript
get(object: THREE.Object3D): string[]
```
Get all tags of an object.

```typescript
const objectTags = RE.Tags.get(myObject);
// ["enemy", "flying"]
```

### set()
```typescript
set(object: THREE.Object3D, ...tags: string[]): void
```
Set tags on an object. Creates tags if they don't exist.

```typescript
RE.Tags.set(this.object3d, "player", "human", "controllable");
```

### remove()
```typescript
remove(object: THREE.Object3D, ...tags: string[]): void
```
Remove tags from an object.

```typescript
RE.Tags.remove(this.object3d, "invincible");
```

### create()
```typescript
create(...tags: string[]): void
```
Create tags without assigning them to objects.

```typescript
RE.Tags.create("newEnemyType", "boss");
```

---

## Common Patterns

### Picking with Tags
```typescript
update() {
  if (RE.Input.getDown("Select")) {
    // Only pick objects tagged as "Selectable"
    const targets = RE.Tags.getWithAll("Selectable");
    const picked = RE.pick(targets)[0]?.object;

    if (picked) {
      // Get the container (nearest ancestor with tag)
      const container = RE.getNearestWithTag(picked, "Selectable");
      this.select(container);
    }
  }
}
```

### Filtering by Tags
```typescript
findEnemiesInRange(position: THREE.Vector3, range: number) {
  const enemies = RE.Tags.getWithAll("enemy");
  return enemies.filter(enemy => {
    const distance = position.distanceTo(enemy.position);
    return distance <= range;
  });
}
```

### Tag-Based Damage System
```typescript
applyDamage(target: THREE.Object3D, damage: number) {
  // Skip if invincible
  if (RE.Tags.hasAny(target, "invincible", "shield")) {
    return;
  }

  // Double damage to enemies
  if (RE.Tags.hasAll(target, "enemy")) {
    damage *= 2;
  }

  const health = HealthComponent.get(target);
  health?.takeDamage(damage);
}
```

### Dynamic Tagging
```typescript
export default class PowerUp extends RE.Component {
  @RE.props.num(5)
  duration: number = 5;

  activate(target: THREE.Object3D) {
    RE.Tags.set(target, "powered-up", "invincible");

    setTimeout(() => {
      RE.Tags.remove(target, "powered-up", "invincible");
    }, this.duration * 1000);
  }
}
```
