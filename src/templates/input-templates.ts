/**
 * @file input-templates.ts
 * @purpose Template generators for input-related components
 */

export interface PlayerControllerOptions {
  name: string;
  includeJump: boolean;
  inputStyle: 'direct' | 'action-based';
}

export function generatePlayerControllerTemplate(options: PlayerControllerOptions): string {
  const { name, includeJump, inputStyle } = options;

  if (inputStyle === 'action-based') {
    return `import * as RE from 'rogue-engine';
import * as THREE from 'three';

export default class ${name} extends RE.Component {
  // Movement settings
  @RE.props.num()
  moveSpeed: number = 5;

  @RE.props.num()
  rotationSpeed: number = 10;
${includeJump ? `
  // Jump settings
  @RE.props.num()
  jumpForce: number = 8;

  @RE.props.num()
  gravity: number = 20;

  private velocityY: number = 0;
  private isGrounded: boolean = true;
` : ''}
  // Movement state
  private moveDirection = new THREE.Vector3();

  awake() {
    // Initialize player controller
  }

  start() {
    // Setup - configure actions in Rogue Engine Input Manager:
    // - "Horizontal": A/D keys or left stick X
    // - "Vertical": W/S keys or left stick Y
${includeJump ? '    // - "Jump": Space key or gamepad A button' : ''}
  }

  update() {
    const deltaTime = RE.Runtime.deltaTime;

    // Get movement input from the action-based system.
    // NOTE: the API is getAxes() and returns a {x, y} pair -- there is no
    // singular getAxis(). "Move" is a default action in the input map.
    const { x: horizontal, y: vertical } = RE.Input.getAxes("Move");
${includeJump ? `
    // Handle jumping
    if (RE.Input.getDown("Jump") && this.isGrounded) {
      this.velocityY = this.jumpForce;
      this.isGrounded = false;
    }

    // Apply gravity
    if (!this.isGrounded) {
      this.velocityY -= this.gravity * deltaTime;
    }
` : ''}
    // Calculate movement direction
    this.moveDirection.set(horizontal, 0, -vertical);

    // Apply movement relative to object's rotation
    if (this.moveDirection.lengthSq() > 0.01) {
      this.moveDirection.normalize();
      this.moveDirection.applyQuaternion(this.object3d.quaternion);
      this.moveDirection.multiplyScalar(this.moveSpeed * deltaTime);

      this.object3d.position.add(this.moveDirection);
    }
${includeJump ? `
    // Apply vertical movement
    this.object3d.position.y += this.velocityY * deltaTime;

    // Simple ground check (adjust for your game)
    if (this.object3d.position.y <= 0) {
      this.object3d.position.y = 0;
      this.velocityY = 0;
      this.isGrounded = true;
    }
` : ''}
  }

  onBeforeRemoved() {
    // Cleanup
  }
}

RE.registerComponent(${name});
`;
  } else {
    // Direct input style
    return `import * as RE from 'rogue-engine';
import * as THREE from 'three';

export default class ${name} extends RE.Component {
  // Movement settings
  @RE.props.num()
  moveSpeed: number = 5;

  @RE.props.num()
  rotationSpeed: number = 10;
${includeJump ? `
  // Jump settings
  @RE.props.num()
  jumpForce: number = 8;

  @RE.props.num()
  gravity: number = 20;

  private velocityY: number = 0;
  private isGrounded: boolean = true;
` : ''}
  // Movement state
  private moveDirection = new THREE.Vector3();

  awake() {
    // Initialize player controller
  }

  start() {
    // Setup
  }

  update() {
    const deltaTime = RE.Runtime.deltaTime;

    // Get direct keyboard input
    let horizontal = 0;
    let vertical = 0;

    if (RE.Input.keyboard.getKeyPressed("KeyA") || RE.Input.keyboard.getKeyPressed("ArrowLeft")) {
      horizontal = -1;
    }
    if (RE.Input.keyboard.getKeyPressed("KeyD") || RE.Input.keyboard.getKeyPressed("ArrowRight")) {
      horizontal = 1;
    }
    if (RE.Input.keyboard.getKeyPressed("KeyW") || RE.Input.keyboard.getKeyPressed("ArrowUp")) {
      vertical = 1;
    }
    if (RE.Input.keyboard.getKeyPressed("KeyS") || RE.Input.keyboard.getKeyPressed("ArrowDown")) {
      vertical = -1;
    }
${includeJump ? `
    // Handle jumping
    if (RE.Input.keyboard.getKeyDown("Space") && this.isGrounded) {
      this.velocityY = this.jumpForce;
      this.isGrounded = false;
    }

    // Apply gravity
    if (!this.isGrounded) {
      this.velocityY -= this.gravity * deltaTime;
    }
` : ''}
    // Calculate movement direction
    this.moveDirection.set(horizontal, 0, -vertical);

    // Apply movement relative to object's rotation
    if (this.moveDirection.lengthSq() > 0.01) {
      this.moveDirection.normalize();
      this.moveDirection.applyQuaternion(this.object3d.quaternion);
      this.moveDirection.multiplyScalar(this.moveSpeed * deltaTime);

      this.object3d.position.add(this.moveDirection);
    }
${includeJump ? `
    // Apply vertical movement
    this.object3d.position.y += this.velocityY * deltaTime;

    // Simple ground check (adjust for your game)
    if (this.object3d.position.y <= 0) {
      this.object3d.position.y = 0;
      this.velocityY = 0;
      this.isGrounded = true;
    }
` : ''}
  }

  onBeforeRemoved() {
    // Cleanup
  }
}

RE.registerComponent(${name});
`;
  }
}
