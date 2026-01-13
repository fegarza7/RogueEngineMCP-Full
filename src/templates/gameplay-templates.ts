/**
 * @file gameplay-templates.ts
 * @purpose Template generators for gameplay-related components
 */

// ============================================================================
// PICKING SYSTEM
// ============================================================================

export interface PickingSystemOptions {
  name: string;
  selectableTag: string;
}

export function generatePickingSystemTemplate(options: PickingSystemOptions): string {
  const { name, selectableTag } = options;

  return `import * as RE from 'rogue-engine';
import * as THREE from 'three';

export default class ${name} extends RE.Component {
  @RE.props.text("${selectableTag}")
  selectableTag: string = "${selectableTag}";

  @RE.props.checkbox(true)
  highlightOnHover: boolean = true;

  @RE.props.color()
  highlightColor: THREE.Color = new THREE.Color(0xffff00);

  private hoveredObject: THREE.Object3D | null = null;
  private selectedObject: THREE.Object3D | null = null;
  private originalMaterials: Map<THREE.Object3D, THREE.Material | THREE.Material[]> = new Map();

  awake() {
    // Initialize picking system
  }

  start() {
    // Setup
  }

  update() {
    // Get all objects with the selectable tag
    const selectables = RE.Tags.getWithAll(this.selectableTag);

    // Perform raycast pick from mouse position
    const picks = RE.pick(selectables);
    const topPick = picks[0];

    // Handle hover
    if (topPick) {
      // Get the container object (nearest ancestor with the tag)
      const container = RE.getNearestWithTag(topPick.object, this.selectableTag);

      if (container !== this.hoveredObject) {
        this.onHoverExit(this.hoveredObject);
        this.hoveredObject = container;
        this.onHoverEnter(container);
      }
    } else {
      if (this.hoveredObject) {
        this.onHoverExit(this.hoveredObject);
        this.hoveredObject = null;
      }
    }

    // Handle selection on click
    if (RE.Input.getDown("Select") || RE.Input.mouse.getButtonDown(0)) {
      if (this.hoveredObject) {
        this.select(this.hoveredObject);
      } else {
        this.deselect();
      }
    }
  }

  private onHoverEnter(object: THREE.Object3D | null) {
    if (!object || !this.highlightOnHover) return;

    // Apply highlight effect
    object.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        this.originalMaterials.set(child, child.material);

        const material = (child.material as THREE.MeshStandardMaterial).clone();
        material.emissive = this.highlightColor;
        material.emissiveIntensity = 0.3;
        child.material = material;
      }
    });
  }

  private onHoverExit(object: THREE.Object3D | null) {
    if (!object || !this.highlightOnHover) return;

    // Restore original materials
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const original = this.originalMaterials.get(child);
        if (original) {
          child.material = original;
          this.originalMaterials.delete(child);
        }
      }
    });
  }

  private select(object: THREE.Object3D) {
    if (this.selectedObject === object) return;

    this.deselect();
    this.selectedObject = object;

    RE.Debug.log(\`Selected: \${object.name}\`);
    // Emit selection event if using EventBus
    // EventBus.emit('object:selected', { object });
  }

  private deselect() {
    if (!this.selectedObject) return;

    RE.Debug.log(\`Deselected: \${this.selectedObject.name}\`);
    // EventBus.emit('object:deselected', { object: this.selectedObject });
    this.selectedObject = null;
  }

  getSelected(): THREE.Object3D | null {
    return this.selectedObject;
  }

  onBeforeRemoved() {
    // Restore all materials on cleanup
    this.originalMaterials.forEach((material, mesh) => {
      if (mesh instanceof THREE.Mesh) {
        mesh.material = material;
      }
    });
    this.originalMaterials.clear();
  }
}

RE.registerComponent(${name});
`;
}

// ============================================================================
// PREFAB SPAWNER
// ============================================================================

export interface PrefabSpawnerOptions {
  name: string;
  spawnOnStart: boolean;
}

export function generatePrefabSpawnerTemplate(options: PrefabSpawnerOptions): string {
  const { name, spawnOnStart } = options;

  return `import * as RE from 'rogue-engine';
import * as THREE from 'three';

export default class ${name} extends RE.Component {
  @RE.props.prefab()
  prefab: RE.Prefab;

  @RE.props.num(1)
  spawnCount: number = 1;

  @RE.props.num(0)
  spawnDelay: number = 0;

  @RE.props.checkbox(${spawnOnStart})
  spawnOnStart: boolean = ${spawnOnStart};

  @RE.props.vector3()
  spawnAreaSize: THREE.Vector3 = new THREE.Vector3(10, 0, 10);

  @RE.props.checkbox(true)
  randomRotation: boolean = true;

  // Track spawned instances
  private instances: THREE.Object3D[] = [];
  private spawnTimer: number = 0;

  awake() {
    // Initialize spawner
  }

  start() {
    if (this.spawnOnStart) {
      this.spawnMultiple(this.spawnCount);
    }
  }

  update() {
    // Optional: timed spawning
    if (this.spawnDelay > 0) {
      this.spawnTimer += RE.Runtime.deltaTime;
      if (this.spawnTimer >= this.spawnDelay) {
        this.spawn();
        this.spawnTimer = 0;
      }
    }
  }

  /**
   * Spawn a single instance of the prefab
   */
  spawn(): THREE.Object3D | null {
    if (!this.prefab) {
      RE.Debug.logWarning("No prefab assigned to spawner");
      return null;
    }

    // Instantiate the prefab
    const instance = this.prefab.instantiate();

    // Calculate spawn position
    const spawnPos = this.getRandomSpawnPosition();
    instance.position.copy(spawnPos);

    // Apply random rotation if enabled
    if (this.randomRotation) {
      instance.rotation.y = Math.random() * Math.PI * 2;
    }

    // Add to scene and track
    RE.App.currentScene.add(instance);
    this.instances.push(instance);

    RE.Debug.log(\`Spawned \${instance.name} at \${spawnPos.x.toFixed(1)}, \${spawnPos.y.toFixed(1)}, \${spawnPos.z.toFixed(1)}\`);

    return instance;
  }

  /**
   * Spawn multiple instances
   */
  spawnMultiple(count: number): THREE.Object3D[] {
    const spawned: THREE.Object3D[] = [];
    for (let i = 0; i < count; i++) {
      const instance = this.spawn();
      if (instance) spawned.push(instance);
    }
    return spawned;
  }

  /**
   * Spawn at a specific position
   */
  spawnAt(position: THREE.Vector3): THREE.Object3D | null {
    const instance = this.spawn();
    if (instance) {
      instance.position.copy(position);
    }
    return instance;
  }

  /**
   * Get random position within spawn area
   */
  private getRandomSpawnPosition(): THREE.Vector3 {
    const pos = this.object3d.position.clone();
    pos.x += (Math.random() - 0.5) * this.spawnAreaSize.x;
    pos.y += (Math.random() - 0.5) * this.spawnAreaSize.y;
    pos.z += (Math.random() - 0.5) * this.spawnAreaSize.z;
    return pos;
  }

  /**
   * Destroy a specific instance
   */
  destroyInstance(instance: THREE.Object3D) {
    const index = this.instances.indexOf(instance);
    if (index !== -1) {
      this.instances.splice(index, 1);
      RE.dispose(instance);
    }
  }

  /**
   * Destroy all spawned instances
   */
  destroyAll() {
    for (const instance of this.instances) {
      RE.dispose(instance);
    }
    this.instances = [];
  }

  /**
   * Get all spawned instances
   */
  getInstances(): THREE.Object3D[] {
    return [...this.instances];
  }

  /**
   * Get instance count
   */
  getInstanceCount(): number {
    return this.instances.length;
  }

  onBeforeRemoved() {
    // Optionally clean up all instances when spawner is removed
    // this.destroyAll();
  }
}

RE.registerComponent(${name});
`;
}

// ============================================================================
// OBJECT POOL
// ============================================================================

export interface ObjectPoolOptions {
  name: string;
  initialSize: number;
  autoGrow: boolean;
}

export function generateObjectPoolTemplate(options: ObjectPoolOptions): string {
  const { name, initialSize, autoGrow } = options;

  return `import * as RE from 'rogue-engine';
import * as THREE from 'three';

export default class ${name} extends RE.Component {
  @RE.props.prefab()
  prefab: RE.Prefab;

  @RE.props.num(${initialSize})
  initialSize: number = ${initialSize};

  @RE.props.checkbox(${autoGrow})
  autoGrow: boolean = ${autoGrow};

  @RE.props.num(100)
  maxSize: number = 100;

  // Pool storage
  private pool: THREE.Object3D[] = [];
  private activeObjects: Set<THREE.Object3D> = new Set();

  awake() {
    // Initialize pool
  }

  start() {
    this.initializePool();
  }

  /**
   * Create initial pool of objects
   */
  private initializePool() {
    if (!this.prefab) {
      RE.Debug.logWarning("No prefab assigned to object pool");
      return;
    }

    for (let i = 0; i < this.initialSize; i++) {
      const obj = this.createPoolObject();
      if (obj) {
        this.pool.push(obj);
      }
    }

    RE.Debug.log(\`Pool initialized with \${this.pool.length} objects\`);
  }

  /**
   * Create a new pool object (inactive)
   */
  private createPoolObject(): THREE.Object3D | null {
    if (!this.prefab) return null;

    const obj = this.prefab.instantiate();
    obj.visible = false;
    RE.App.currentScene.add(obj);
    return obj;
  }

  /**
   * Get an object from the pool
   */
  get(): THREE.Object3D | null {
    let obj: THREE.Object3D | undefined;

    // Try to get from inactive pool
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    }
    // Auto-grow if allowed
    else if (this.autoGrow && this.activeObjects.size < this.maxSize) {
      obj = this.createPoolObject() || undefined;
    }

    if (obj) {
      obj.visible = true;
      this.activeObjects.add(obj);
      this.onActivate(obj);
      return obj;
    }

    RE.Debug.logWarning("Pool exhausted - no objects available");
    return null;
  }

  /**
   * Return an object to the pool
   */
  release(obj: THREE.Object3D) {
    if (!this.activeObjects.has(obj)) {
      RE.Debug.logWarning("Object not from this pool");
      return;
    }

    this.activeObjects.delete(obj);
    this.onDeactivate(obj);
    obj.visible = false;
    obj.position.set(0, -1000, 0); // Move off-screen
    this.pool.push(obj);
  }

  /**
   * Called when object is activated (override for custom behavior)
   */
  protected onActivate(obj: THREE.Object3D) {
    // Reset object state
    obj.position.set(0, 0, 0);
    obj.rotation.set(0, 0, 0);
    obj.scale.set(1, 1, 1);
  }

  /**
   * Called when object is deactivated (override for custom behavior)
   */
  protected onDeactivate(obj: THREE.Object3D) {
    // Clean up object state
  }

  /**
   * Get number of available objects
   */
  getAvailableCount(): number {
    return this.pool.length;
  }

  /**
   * Get number of active objects
   */
  getActiveCount(): number {
    return this.activeObjects.size;
  }

  /**
   * Get all active objects
   */
  getActiveObjects(): THREE.Object3D[] {
    return Array.from(this.activeObjects);
  }

  /**
   * Release all active objects back to pool
   */
  releaseAll() {
    const active = Array.from(this.activeObjects);
    for (const obj of active) {
      this.release(obj);
    }
  }

  /**
   * Pre-warm pool with additional objects
   */
  preWarm(count: number) {
    const toCreate = Math.min(count, this.maxSize - this.pool.length - this.activeObjects.size);
    for (let i = 0; i < toCreate; i++) {
      const obj = this.createPoolObject();
      if (obj) this.pool.push(obj);
    }
  }

  onBeforeRemoved() {
    // Clean up all pooled objects
    for (const obj of this.pool) {
      RE.dispose(obj);
    }
    for (const obj of this.activeObjects) {
      RE.dispose(obj);
    }
    this.pool = [];
    this.activeObjects.clear();
  }
}

RE.registerComponent(${name});
`;
}

// ============================================================================
// TAG FILTER
// ============================================================================

export interface TagFilterOptions {
  name: string;
}

export function generateTagFilterTemplate(options: TagFilterOptions): string {
  const { name } = options;

  return `import * as RE from 'rogue-engine';
import * as THREE from 'three';

/**
 * Tag-based object filtering utilities
 * Provides methods to query objects by tags with various filters
 */
export default class ${name} extends RE.Component {
  // Cache for frequently queried results
  private cache: Map<string, { objects: THREE.Object3D[]; timestamp: number }> = new Map();

  @RE.props.num(100)
  cacheLifetimeMs: number = 100;

  awake() {
    // Initialize tag filter
  }

  /**
   * Get objects with a specific tag
   */
  getByTag(tag: string): THREE.Object3D[] {
    return RE.Tags.getWithAll(tag);
  }

  /**
   * Get objects with ALL specified tags
   */
  getWithAllTags(...tags: string[]): THREE.Object3D[] {
    return RE.Tags.getWithAll(...tags);
  }

  /**
   * Get objects with ANY of the specified tags
   */
  getWithAnyTag(...tags: string[]): THREE.Object3D[] {
    return RE.Tags.getWithAny(...tags);
  }

  /**
   * Get objects within range that have a specific tag
   */
  getInRange(position: THREE.Vector3, range: number, tag: string): THREE.Object3D[] {
    const objects = RE.Tags.getWithAll(tag);
    return objects.filter(obj => {
      const distance = position.distanceTo(obj.position);
      return distance <= range;
    });
  }

  /**
   * Get objects within range with any of the specified tags
   */
  getInRangeWithAny(position: THREE.Vector3, range: number, ...tags: string[]): THREE.Object3D[] {
    const objects = RE.Tags.getWithAny(...tags);
    return objects.filter(obj => {
      const distance = position.distanceTo(obj.position);
      return distance <= range;
    });
  }

  /**
   * Get the closest object with a specific tag
   */
  getClosest(position: THREE.Vector3, tag: string): THREE.Object3D | null {
    const objects = RE.Tags.getWithAll(tag);
    let closest: THREE.Object3D | null = null;
    let closestDistance = Infinity;

    for (const obj of objects) {
      const distance = position.distanceTo(obj.position);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = obj;
      }
    }

    return closest;
  }

  /**
   * Get N closest objects with a specific tag
   */
  getNClosest(position: THREE.Vector3, tag: string, count: number): THREE.Object3D[] {
    const objects = RE.Tags.getWithAll(tag);

    return objects
      .map(obj => ({ obj, distance: position.distanceTo(obj.position) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count)
      .map(item => item.obj);
  }

  /**
   * Check if any object with tag is within range
   */
  anyInRange(position: THREE.Vector3, range: number, tag: string): boolean {
    const objects = RE.Tags.getWithAll(tag);
    return objects.some(obj => position.distanceTo(obj.position) <= range);
  }

  /**
   * Count objects with a specific tag
   */
  countByTag(tag: string): number {
    return RE.Tags.getWithAll(tag).length;
  }

  /**
   * Filter objects by custom predicate
   */
  filterByTag(tag: string, predicate: (obj: THREE.Object3D) => boolean): THREE.Object3D[] {
    return RE.Tags.getWithAll(tag).filter(predicate);
  }

  /**
   * Get objects excluding those with certain tags
   */
  getExcluding(includeTag: string, ...excludeTags: string[]): THREE.Object3D[] {
    const objects = RE.Tags.getWithAll(includeTag);
    return objects.filter(obj => RE.Tags.hasNone(obj, ...excludeTags));
  }

  /**
   * Get cached results (use for frequently called queries)
   */
  getCached(cacheKey: string, query: () => THREE.Object3D[]): THREE.Object3D[] {
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.cacheLifetimeMs) {
      return cached.objects;
    }

    const result = query();
    this.cache.set(cacheKey, { objects: result, timestamp: now });
    return result;
  }

  /**
   * Clear the query cache
   */
  clearCache() {
    this.cache.clear();
  }

  // Static utility methods for use without component reference
  static getByTag(tag: string): THREE.Object3D[] {
    return RE.Tags.getWithAll(tag);
  }

  static getInRange(position: THREE.Vector3, range: number, tag: string): THREE.Object3D[] {
    return RE.Tags.getWithAll(tag).filter(obj =>
      position.distanceTo(obj.position) <= range
    );
  }

  static getClosest(position: THREE.Vector3, tag: string): THREE.Object3D | null {
    let closest: THREE.Object3D | null = null;
    let closestDist = Infinity;

    for (const obj of RE.Tags.getWithAll(tag)) {
      const dist = position.distanceTo(obj.position);
      if (dist < closestDist) {
        closestDist = dist;
        closest = obj;
      }
    }

    return closest;
  }

  onBeforeRemoved() {
    this.clearCache();
  }
}

RE.registerComponent(${name});
`;
}
