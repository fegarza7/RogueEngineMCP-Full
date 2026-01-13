# Debug

The **Debug** controller provides logging methods for the editor console. In built projects, logs appear in the browser console.

Access via `RE.Debug`.

## Methods

### log()
```typescript
log(message: string): void
```
Log a standard message (white in editor console).

```typescript
RE.Debug.log("Player spawned");
RE.Debug.log(`Score: ${this.score}`);
```

### logError()
```typescript
logError(message: string): void
```
Log an error message (red in editor console).

```typescript
RE.Debug.logError("Failed to load asset");
RE.Debug.logError(`Missing component: ${componentName}`);
```

### logWarning()
```typescript
logWarning(message: string): void
```
Log a warning message (yellow in editor console).

```typescript
RE.Debug.logWarning("Low health");
RE.Debug.logWarning(`Deprecated method used in ${this.name}`);
```

### clear()
```typescript
clear(): void
```
Clear all logs from the console.

```typescript
RE.Debug.clear();
```

---

## Event Hooks

### onAddLog()
```typescript
onAddLog(callback: (log: Log) => void): { stop: () => void }
```
Hook into log events. Returns object with `stop()` to remove listener.

```typescript
const listener = RE.Debug.onAddLog((log) => {
  // Custom log handling
  sendToAnalytics(log);
});

// Stop listening
listener.stop();
```

### onClearLogs()
```typescript
onClearLogs(callback: () => void): { stop: () => void }
```
Hook into log clear events.

```typescript
RE.Debug.onClearLogs(() => {
  console.log("Logs cleared");
});
```

---

## Usage Notes

- Debug messages only accept strings
- In the editor, logs appear in the editor console
- In built projects, logs appear in browser developer tools
- Use strategic logging - avoid logging every frame
- Clear logs when they're no longer relevant

## Example

```typescript
import * as RE from 'rogue-engine';

export default class GameManager extends RE.Component {
  start() {
    RE.Debug.log("Game started");
  }

  onPlayerDeath() {
    RE.Debug.logWarning("Player died - respawning...");
  }

  onCriticalError(error: string) {
    RE.Debug.logError(`Critical: ${error}`);
  }

  resetGame() {
    RE.Debug.clear();
    RE.Debug.log("Game reset");
  }
}

RE.registerComponent(GameManager);
```
