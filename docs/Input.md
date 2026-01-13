# Input System

The **Input** controller provides a unified input handling system for keyboard, mouse, touch, and gamepad.

Access via `RE.Input`.

## Properties

### .mouse
```typescript
mouse: Mouse
```
The Mouse instance for handling mouse events.

### .keyboard
```typescript
keyboard: Keyboard
```
The Keyboard instance for handling keyboard events.

### .touch
```typescript
touch: TouchController
```
The Touch instance for handling touch events.

### .gamepads
```typescript
gamepads: GamepadController[]
```
List of connected gamepad controllers in order of activation.

### .playerInputs
```typescript
playerInputs: {
  MouseAndKeyboard: number;
  Gamepads: number[];
}
```
Input configuration for multiplayer. Numbers represent player index (0 = player 1).

**Default:**
```typescript
{
  MouseAndKeyboard: 0, // Player 1 uses mouse/keyboard
  Gamepads: [0],       // Player 1 uses first gamepad
}
```

---

## Action-Based Input System

The preferred way to handle input in Rogue Engine. Define actions once, then query them regardless of input device.

### setActionMap()
```typescript
setActionMap(bindings: InputAction): void
```
Set all input bindings at once.

**Example:**
```typescript
RE.Input.setActionMap({
  Move: {
    type: "Axes",
    Keyboard: ["KeyW", "KeyS", "KeyA", "KeyD"],
    Gamepad: { x: 0, y: 1 },
    Touch: { area: "left", normalize: [10, 10] },
  },
  Look: {
    type: "Axes",
    Gamepad: { x: 2, y: 3, mult: [5, 2] },
    Mouse: [0.5, 0.5],
    Touch: { area: "right", mult: [2, 2] },
  },
  Jump: { type: "Button", Keyboard: "Space", Gamepad: 0, Touch: 1 },
  Fire: { type: "Button", Mouse: 0, Gamepad: 7, Touch: 0 },
  Select: { type: "Button", Mouse: 0, Touch: "Tap" },
});
```

### bindAxes()
```typescript
bindAxes(actionName: string, bind: {
  Gamepad?: GamepadAxes,
  Keyboard?: KeyboardAxes,
  Mouse?: MouseAxes,
  Touch?: TouchAxes,
}, player?: number): void
```
Bind an axes-based action. Use `Mapping.Action` pattern for separate mappings.

**Example:**
```typescript
// Movement with WASD
RE.Input.bindAxes("Move", { Keyboard: ["KeyW", "KeyS", "KeyA", "KeyD"] });

// Look with mouse
RE.Input.bindAxes("Look", { Mouse: [0.5, 0.5] });

// Separate vehicle steering mapping
RE.Input.bindAxes("Vehicle.Steer", { Gamepad: { x: 0 }, Keyboard: [,, "KeyA", "KeyD"] });
```

### bindButton()
```typescript
bindButton(actionName: string, bind: {
  Gamepad?: number,
  Keyboard?: string,
  Mouse?: number | "WheelUp" | "WheelDown",
  Touch?: number | "Tap",
}, player?: number): void
```
Bind a button-based action.

**Example:**
```typescript
RE.Input.bindButton("Jump", { Keyboard: "Space", Gamepad: 0, Touch: 1 });
RE.Input.bindButton("Select", { Mouse: 0, Touch: "Tap" });
```

### getAxes()
```typescript
getAxes(name: string, player?: number): { x: number, y: number }
```
Get axes values for an action. Returns vector with values from configured devices.

**Example:**
```typescript
update() {
  const { x, y } = RE.Input.getAxes("Move");
  this.object3d.position.x += x * this.speed * RE.Runtime.deltaTime;
  this.object3d.position.z += y * this.speed * RE.Runtime.deltaTime;
}
```

### getDown()
```typescript
getDown(name: string, player?: number): boolean
```
Returns true on the frame a button action is pressed.

```typescript
if (RE.Input.getDown("Jump")) {
  this.jump();
}
```

### getUp()
```typescript
getUp(name: string, player?: number): boolean
```
Returns true on the frame a button action is released.

```typescript
if (RE.Input.getUp("Select")) {
  this.picked = RE.pick(RE.Runtime.scene.children);
}
```

### getPressed()
```typescript
getPressed(name: string, player?: number): number | true
```
Returns true/value on every frame the button is held.

```typescript
if (RE.Input.getPressed("Fire")) {
  this.shootBullet();
}
```

### getPlayerConfig()
```typescript
getPlayerConfig(player?: number): {
  gamepadIndex: number | undefined;
  useMouseAndKeyboard: boolean;
}
```
Get input configuration for a specific player.

---

# Mouse

Access via `RE.Input.mouse`.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `x` | `number` | Mouse X position (clientX) |
| `y` | `number` | Mouse Y position (clientY) |
| `viewX` | `number` | X position relative to canvas |
| `viewY` | `number` | Y position relative to canvas |
| `movementX` | `number` | Mouse X movement delta |
| `movementY` | `number` | Mouse Y movement delta |
| `wheelX` | `number` | Horizontal scroll amount |
| `wheelY` | `number` | Vertical scroll amount |
| `isMoving` | `boolean` | True if mouse is moving |
| `isLeftButtonDown` | `boolean` | True on frame left button pressed |
| `isLeftButtonPressed` | `boolean` | True while left button held |
| `isLeftButtonUp` | `boolean` | True on frame left button released |
| `isRightButtonDown` | `boolean` | True on frame right button pressed |
| `isRightButtonPressed` | `boolean` | True while right button held |
| `isRightButtonUp` | `boolean` | True on frame right button released |
| `isMidButtonDown` | `boolean` | True on frame middle button pressed |
| `isMidButtonPressed` | `boolean` | True while middle button held |
| `isMidButtonUp` | `boolean` | True on frame middle button released |
| `pointerLock` | `PointerLockControls` | Pointer lock controls instance |
| `enabled` | `boolean` | Enable/disable mouse controls |

## Methods

### lock() / unlock()
```typescript
lock(): void
unlock(): void
```
Lock or unlock the mouse pointer (for FPS-style controls).

### getButtonDown() / getButtonPressed() / getButtonUp()
```typescript
getButtonDown(button: number): boolean
getButtonPressed(button: number): boolean
getButtonUp(button: number): boolean
```
Check button state. Button: 0=left, 1=middle, 2=right.

---

# Keyboard

Access via `RE.Input.keyboard`.

Key codes follow [KeyboardEvent.code](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values).

## Methods

### getKeyDown()
```typescript
getKeyDown(keyCode: string): boolean
```
True on the frame the key was pressed.

```typescript
if (RE.Input.keyboard.getKeyDown("Space")) {
  this.jump();
}
```

### getKeyPressed()
```typescript
getKeyPressed(keyCode: string): boolean
```
True while the key is held down.

```typescript
if (RE.Input.keyboard.getKeyPressed("KeyW")) {
  this.moveForward();
}
```

### getKeyUp()
```typescript
getKeyUp(keyCode: string): boolean
```
True on the frame the key was released.

## Common Key Codes

| Key | Code |
|-----|------|
| W, A, S, D | `"KeyW"`, `"KeyA"`, `"KeyS"`, `"KeyD"` |
| Arrow keys | `"ArrowUp"`, `"ArrowDown"`, `"ArrowLeft"`, `"ArrowRight"` |
| Space | `"Space"` |
| Enter | `"Enter"` |
| Escape | `"Escape"` |
| Shift | `"ShiftLeft"`, `"ShiftRight"` |
| Control | `"ControlLeft"`, `"ControlRight"` |
| Tab | `"Tab"` |
| Numbers | `"Digit0"` through `"Digit9"` |
| F keys | `"F1"` through `"F12"` |

---

# TouchController

Access via `RE.Input.touch`.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `touches` | `TouchInteraction[]` | All current touch events |
| `startTouches` | `TouchInteraction[]` | Touches that started this frame |
| `endTouches` | `TouchInteraction[]` | Touches that ended this frame |
| `leftTouches` | `TouchInteraction[]` | Touches on left half of screen |
| `rightTouches` | `TouchInteraction[]` | Touches on right half of screen |
| `leftStartTouches` | `TouchInteraction[]` | New touches on left half |
| `rightStartTouches` | `TouchInteraction[]` | New touches on right half |
| `leftEndTouches` | `TouchInteraction[]` | Ended touches on left half |
| `rightEndTouches` | `TouchInteraction[]` | Ended touches on right half |
| `buttons` | `TouchButton[]` | Registered touch buttons |
| `enabled` | `boolean` | Enable/disable touch controls |

## TouchInteraction Type
```typescript
type TouchInteraction = {
  id: string;
  touch: Touch;
  x: number;
  y: number;
  viewX: number;
  viewY: number;
  deltaX: number;
  deltaY: number;
  movedX: number;
  movedY: number;
  originX: number;
  originY: number;
}
```

## Methods

### createButton()
```typescript
createButton(elem: HTMLDivElement, stopPropagation?: boolean): TouchButton
```
Create a touch button from an HTML element.

---

# GamepadController

Access via `RE.Input.gamepads[index]`.

## Properties

### axesErrorMargin
```typescript
axesErrorMargin: number = 0.1
```
Dead zone for analog sticks.

### gamepad
```typescript
readonly gamepad: Gamepad
```
The native Gamepad object.

## Methods

### getAxis()
```typescript
getAxis(index: number): number
```
Get axis value (-1 to 1). Standard mapping:
- 0: Left stick X
- 1: Left stick Y
- 2: Right stick X
- 3: Right stick Y

### getButton()
```typescript
getButton(index: number): number
```
Get button value (0 to 1). Useful for triggers.

### getButtonDown()
```typescript
getButtonDown(index: number): boolean
```
True on frame button pressed.

### getButtonUp()
```typescript
getButtonUp(index: number): boolean
```
True on frame button released.

## Standard Gamepad Button Mapping

| Index | Button |
|-------|--------|
| 0 | A / Cross |
| 1 | B / Circle |
| 2 | X / Square |
| 3 | Y / Triangle |
| 4 | Left Bumper |
| 5 | Right Bumper |
| 6 | Left Trigger |
| 7 | Right Trigger |
| 8 | Select / Back |
| 9 | Start |
| 10 | Left Stick Press |
| 11 | Right Stick Press |
| 12-15 | D-Pad (Up, Down, Left, Right) |

---

# Input Types

## GamepadAxes
```typescript
type GamepadAxes = {
  x?: number;
  y?: number;
  mult?: [x: number, y: number];
} | [up?: number, down?: number, left?: number, right?: number, mult?: [number, number]]
```

## KeyboardAxes
```typescript
type KeyboardAxes = [up?: string, down?: string, left?: string, right?: string, mult?: [number, number]]
```

## MouseAxes
```typescript
type MouseAxes = [xMult: number, yMult: number]
```

## TouchAxes
```typescript
type TouchAxes = {
  area: "left" | "right" | "view";
  mult?: [x: number, y: number];
  normalize?: [radiusX: number, radiusY: number];
} | [up?: number, down?: number, left?: number, right?: number, mult?: [number, number]]
```

## InputAction
```typescript
type InputAction = {
  [name: string]: InputAxesBinds | InputBinds;
}
```

## InputBinds
```typescript
type InputBinds = {
  type: "Button";
  Keyboard?: string;
  Mouse?: number | "WheelUp" | "WheelDown";
  Gamepad?: number;
  Touch?: number | "Tap";
}
```
