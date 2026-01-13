/**
 * @file manager-templates.ts
 * @purpose Template generators for manager-type components
 */

// ============================================================================
// AUDIO MANAGER
// ============================================================================

export interface AudioManagerOptions {
  name: string;
  trackCount: number;
}

export function generateAudioManagerTemplate(options: AudioManagerOptions): string {
  const { name, trackCount } = options;

  // Generate audio properties based on track count
  const audioProps: string[] = [];
  const playMethods: string[] = [];

  for (let i = 0; i < trackCount; i++) {
    if (i === 0) {
      audioProps.push(`  @RE.props.audio()
  music: RE.AudioAsset;`);
      playMethods.push(`  playMusic() {
    if (this.musicEnabled && this.music) {
      this.music.play();
    }
  }

  stopMusic() {
    if (this.music) {
      this.music.stop();
    }
  }`);
    } else {
      audioProps.push(`  @RE.props.audio()
  sfx${i}: RE.AudioAsset;`);
      playMethods.push(`  playSfx${i}() {
    if (this.sfxEnabled && this.sfx${i}) {
      this.sfx${i}.play();
    }
  }`);
    }
  }

  return `import * as RE from 'rogue-engine';

export default class ${name} extends RE.Component {
  // Volume controls
  @RE.props.num(1)
  masterVolume: number = 1;

  @RE.props.num(0.7)
  musicVolume: number = 0.7;

  @RE.props.num(1)
  sfxVolume: number = 1;

  // Enable toggles
  @RE.props.checkbox(true)
  musicEnabled: boolean = true;

  @RE.props.checkbox(true)
  sfxEnabled: boolean = true;

  // Audio assets
${audioProps.join('\n\n')}

  // Singleton reference
  private static instance: ${name} | null = null;

  awake() {
    // Singleton pattern
    if (${name}.instance && ${name}.instance !== this) {
      RE.Debug.logWarning("Multiple ${name} instances - using first one");
      return;
    }
    ${name}.instance = this;
  }

  start() {
    // Auto-play music if enabled
    if (this.musicEnabled && this.music) {
      this.playMusic();
    }
  }

  // Static accessor
  static get(): ${name} | null {
    return ${name}.instance;
  }

  // Volume controls
  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }

  setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  // Toggle methods
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.playMusic();
    } else {
      this.stopMusic();
    }
  }

  toggleSfx() {
    this.sfxEnabled = !this.sfxEnabled;
  }

  // Audio playback methods
${playMethods.join('\n\n')}

  // Generic play method for any assigned audio
  playSound(audio: RE.AudioAsset | undefined) {
    if (this.sfxEnabled && audio) {
      audio.play();
    }
  }

  // Stop all audio
  stopAll() {
    this.stopMusic();
    // Note: SFX typically play to completion
  }

  onBeforeRemoved() {
    this.stopAll();
    if (${name}.instance === this) {
      ${name}.instance = null;
    }
  }
}

RE.registerComponent(${name});
`;
}

// ============================================================================
// EVENT MANAGER
// ============================================================================

export interface EventManagerOptions {
  name: string;
}

export function generateEventManagerTemplate(options: EventManagerOptions): string {
  const { name } = options;

  return `import * as RE from 'rogue-engine';

// Event listener type
type EventCallback = (...args: any[]) => void;

interface EventListener {
  event: string;
  callback: EventCallback;
  unsubscribe: () => void;
}

export default class ${name} extends RE.Component {
  // Store all event listeners for cleanup
  private listeners: EventListener[] = [];

  // Singleton reference
  private static instance: ${name} | null = null;

  awake() {
    // Singleton pattern
    if (${name}.instance && ${name}.instance !== this) {
      RE.Debug.logWarning("Multiple ${name} instances");
      return;
    }
    ${name}.instance = this;
  }

  start() {
    this.setupListeners();
  }

  static get(): ${name} | null {
    return ${name}.instance;
  }

  /**
   * Setup all event listeners
   * Override this method to add your game's event listeners
   */
  protected setupListeners() {
    // Example listeners - customize for your game:
    // this.on('player:damaged', this.onPlayerDamaged.bind(this));
    // this.on('enemy:defeated', this.onEnemyDefeated.bind(this));
    // this.on('item:collected', this.onItemCollected.bind(this));

    RE.Debug.log("Event listeners setup complete");
  }

  /**
   * Subscribe to a Runtime event with automatic cleanup
   */
  on(event: string, callback: EventCallback): EventListener {
    const handler = RE.Runtime.onEvent(event, callback);

    const listener: EventListener = {
      event,
      callback,
      unsubscribe: () => handler.stop()
    };

    this.listeners.push(listener);
    return listener;
  }

  /**
   * Emit a Runtime event
   */
  emit(event: string, ...args: any[]) {
    RE.Runtime.emitEvent(event, ...args);
  }

  /**
   * Unsubscribe a specific listener
   */
  off(listener: EventListener) {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      listener.unsubscribe();
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Unsubscribe all listeners for a specific event
   */
  offAll(event: string) {
    const toRemove = this.listeners.filter(l => l.event === event);
    for (const listener of toRemove) {
      this.off(listener);
    }
  }

  /**
   * Static emit helper
   */
  static emit(event: string, ...args: any[]) {
    RE.Runtime.emitEvent(event, ...args);
  }

  // Example event handlers - customize for your game:
  /*
  private onPlayerDamaged(data: { damage: number; source: string }) {
    RE.Debug.log(\`Player took \${data.damage} damage from \${data.source}\`);
  }

  private onEnemyDefeated(data: { enemy: string; points: number }) {
    RE.Debug.log(\`Defeated \${data.enemy} for \${data.points} points\`);
  }

  private onItemCollected(data: { item: string }) {
    RE.Debug.log(\`Collected \${data.item}\`);
  }
  */

  onBeforeRemoved() {
    // Clean up ALL listeners
    for (const listener of this.listeners) {
      listener.unsubscribe();
    }
    this.listeners = [];

    if (${name}.instance === this) {
      ${name}.instance = null;
    }
  }
}

RE.registerComponent(${name});
`;
}

// ============================================================================
// GAME MANAGER
// ============================================================================

export interface GameManagerOptions {
  name: string;
  includeSceneManagement: boolean;
}

export function generateGameManagerTemplate(options: GameManagerOptions): string {
  const { name, includeSceneManagement } = options;

  const sceneManagementCode = includeSceneManagement ? `
  // Scene management
  @RE.props.text()
  mainMenuScene: string = "MainMenu";

  @RE.props.text()
  gameScene: string = "Game";

  /**
   * Load main menu scene
   */
  loadMainMenu() {
    this.gameState = "menu";
    if (this.mainMenuScene) {
      RE.App.loadScene(this.mainMenuScene);
    }
  }

  /**
   * Start new game
   */
  startGame() {
    this.score = 0;
    this.gameState = "playing";
    if (this.gameScene) {
      RE.App.loadScene(this.gameScene);
    }
  }

  /**
   * Load a specific scene
   */
  loadScene(sceneName: string) {
    RE.App.loadScene(sceneName);
  }

  /**
   * Restart current scene
   */
  restartScene() {
    const currentScene = RE.App.currentScene.name;
    RE.App.loadScene(currentScene);
  }` : `
  /**
   * Start new game
   */
  startGame() {
    this.score = 0;
    this.gameState = "playing";
  }`;

  return `import * as RE from 'rogue-engine';

type GameState = "menu" | "playing" | "paused" | "gameover";

export default class ${name} extends RE.Component {
  // Game state
  @RE.props.select()
  @RE.props.options(["menu", "playing", "paused", "gameover"])
  gameState: GameState = "menu";

  // Score tracking
  @RE.props.num(0)
  score: number = 0;

  @RE.props.num(0)
  highScore: number = 0;

  // Time tracking
  private playTime: number = 0;
  private lastPauseTime: number = 0;

  // Singleton reference
  private static instance: ${name} | null = null;

  awake() {
    // Singleton pattern
    if (${name}.instance && ${name}.instance !== this) {
      RE.Debug.logWarning("Multiple ${name} instances");
      return;
    }
    ${name}.instance = this;

    // Load high score from storage
    this.loadHighScore();
  }

  start() {
    RE.Debug.log("Game Manager initialized");
  }

  update() {
    // Track play time when playing
    if (this.gameState === "playing") {
      this.playTime += RE.Runtime.deltaTime;
    }
  }

  static get(): ${name} | null {
    return ${name}.instance;
  }
${sceneManagementCode}

  // Pause/Resume
  pause() {
    if (this.gameState === "playing") {
      this.gameState = "paused";
      this.lastPauseTime = Date.now();
      RE.Runtime.emitEvent("game:paused");
      RE.Debug.log("Game paused");
    }
  }

  resume() {
    if (this.gameState === "paused") {
      this.gameState = "playing";
      RE.Runtime.emitEvent("game:resumed");
      RE.Debug.log("Game resumed");
    }
  }

  togglePause() {
    if (this.gameState === "playing") {
      this.pause();
    } else if (this.gameState === "paused") {
      this.resume();
    }
  }

  // Game over
  gameOver() {
    this.gameState = "gameover";

    // Check for new high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
      RE.Debug.log(\`New high score: \${this.highScore}\`);
    }

    RE.Runtime.emitEvent("game:over", { score: this.score, highScore: this.highScore });
    RE.Debug.log(\`Game Over! Score: \${this.score}\`);
  }

  // Score management
  addScore(points: number) {
    this.score += points;
    RE.Runtime.emitEvent("score:changed", { score: this.score, delta: points });
  }

  getScore(): number {
    return this.score;
  }

  getHighScore(): number {
    return this.highScore;
  }

  // Time tracking
  getPlayTime(): number {
    return this.playTime;
  }

  getPlayTimeFormatted(): string {
    const minutes = Math.floor(this.playTime / 60);
    const seconds = Math.floor(this.playTime % 60);
    return \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
  }

  // State queries
  isPaused(): boolean {
    return this.gameState === "paused";
  }

  isPlaying(): boolean {
    return this.gameState === "playing";
  }

  isGameOver(): boolean {
    return this.gameState === "gameover";
  }

  // Persistence
  private loadHighScore() {
    try {
      const saved = localStorage.getItem('${name.toLowerCase()}_highscore');
      if (saved) {
        this.highScore = parseInt(saved, 10);
      }
    } catch (e) {
      // localStorage not available
    }
  }

  private saveHighScore() {
    try {
      localStorage.setItem('${name.toLowerCase()}_highscore', this.highScore.toString());
    } catch (e) {
      // localStorage not available
    }
  }

  onBeforeRemoved() {
    if (${name}.instance === this) {
      ${name}.instance = null;
    }
  }
}

RE.registerComponent(${name});
`;
}
