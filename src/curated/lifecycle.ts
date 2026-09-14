/**
 * Component lifecycle. Hand-written: this is pedagogy about ORDER and intent,
 * which no .d.ts can express. Not generated, not overwritten.
 */
export interface LifecycleMethod {
  name: string;
  description: string;
  whenCalled: string;
  example?: string;
}

export const LIFECYCLE: LifecycleMethod[] = [
  {
    "name": "awake()",
    "description": "Initialize variables and setup state. Called before any other lifecycle method.",
    "whenCalled": "Once, before the first frame and before start()",
    "example": "awake() {\n  this.velocity = new THREE.Vector3();\n  this.isReady = false;\n}"
  },
  {
    "name": "start()",
    "description": "Setup that may depend on other components being ready.",
    "whenCalled": "Once, after awake() and when the component is ready",
    "example": "start() {\n  this.playerController = PlayerController.get(this.object3d);\n  console.log(\"Component started on:\", this.object3d.name);\n}"
  },
  {
    "name": "beforeUpdate()",
    "description": "Pre-update logic that runs before the main update.",
    "whenCalled": "Every frame, before update()"
  },
  {
    "name": "update()",
    "description": "Primary game loop logic. Use RE.Runtime.deltaTime for frame-independent movement.",
    "whenCalled": "Every frame",
    "example": "update() {\n  this.object3d.position.x += this.speed * RE.Runtime.deltaTime;\n}"
  },
  {
    "name": "afterUpdate()",
    "description": "Post-update logic that runs after the main update.",
    "whenCalled": "Every frame, after update()"
  },
  {
    "name": "onBeforeRemoved()",
    "description": "Cleanup: remove event listeners, dispose resources, stop sounds.",
    "whenCalled": "Once, just before the component is removed",
    "example": "onBeforeRemoved() {\n  this.eventListener?.stop();\n  this.sound?.stop();\n}"
  }
];
