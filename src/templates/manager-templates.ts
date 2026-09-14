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

  // One AudioPlayer slot per requested track. AudioPlayer is a built-in
  // component, so the heavy lifting (playlists, fades, bus routing) is the
  // engine's job -- this manager just orchestrates.
  const playerProps: string[] = [];
  for (let i = 0; i < trackCount; i++) {
    playerProps.push(
      `  /** Assign an object carrying an AudioPlayer3D (or AudioPlayer) component. */`,
      `  @RE.props.component(RE.AudioPlayer3D) sfx${i}: RE.AudioPlayer3D;`
    );
  }

  return `import * as RE from 'rogue-engine';

/**
 * ${name} -- thin orchestrator over the engine's built-in audio stack.
 *
 * Volume is applied through RE.AudioMixer buses, NOT by storing numbers on this
 * component. AudioMixer is static and global: setVolume(bus, v) affects every
 * player routed to that bus.
 *
 * Setup:
 *  1. Add an AudioPlayer component for music and AudioPlayer3D components for
 *     positional SFX (Add Object / Add Component in the editor).
 *  2. Set each player's Bus in the inspector (Music, SFX, UI, ...).
 *  3. Drag those objects onto the props below.
 */
@RE.registerComponent
export default class ${name} extends RE.Component {
  private static instance: ${name} | null = null;

  /** Object carrying the AudioPlayer used for music/playlists. */
  @RE.props.component(RE.AudioPlayer) music: RE.AudioPlayer;

${playerProps.join('\n')}

  @RE.props.num(0, 1) masterVolume = 1;
  @RE.props.num(0, 1) musicVolume = 1;
  @RE.props.num(0, 1) sfxVolume = 1;

  awake() {
    ${name}.instance = this;
  }

  start() {
    // Push the inspector values into the mixer once everything exists.
    this.applyVolumes();
  }

  static get(): ${name} | null {
    return ${name}.instance;
  }

  /** Re-applies all three volumes to the mixer. */
  applyVolumes() {
    RE.AudioMixer.setMasterVolume(this.masterVolume);
    RE.AudioMixer.setVolume(RE.AudioMixer.bus.Music, this.musicVolume);
    RE.AudioMixer.setVolume(RE.AudioMixer.bus.SFX, this.sfxVolume);
  }

  setMasterVolume(v: number) {
    this.masterVolume = Math.max(0, Math.min(1, v));
    RE.AudioMixer.setMasterVolume(this.masterVolume);
  }

  setMusicVolume(v: number) {
    this.musicVolume = Math.max(0, Math.min(1, v));
    RE.AudioMixer.setVolume(RE.AudioMixer.bus.Music, this.musicVolume);
  }

  setSfxVolume(v: number) {
    this.sfxVolume = Math.max(0, Math.min(1, v));
    RE.AudioMixer.setVolume(RE.AudioMixer.bus.SFX, this.sfxVolume);
  }

  playMusic(trackIndex?: number, fadeIn = 1) {
    this.music?.play(trackIndex, fadeIn);
  }

  stopMusic(fadeOut = 1) {
    this.music?.fadeOutNow(fadeOut);
  }

  nextTrack() { this.music?.next(); }
  toggleMusic() { this.music?.togglePlay(); }

  /** Play any AudioPlayer you hold a reference to. */
  playSound(player?: RE.AudioPlayer | RE.AudioPlayer3D) {
    player?.play();
  }

  /**
   * One-shot from a raw AudioAsset prop.
   * NOTE: AudioAsset itself has no play() -- you must get the THREE.Audio.
   * Prefer an AudioPlayer component for anything reused.
   */
  playOneShot(asset?: RE.AudioAsset) {
    const audio = asset?.getAudio();
    if (audio && !audio.isPlaying) audio.play();
  }

  stopAll() {
    this.stopMusic(0);
  }

  onBeforeRemoved() {
    if (${name}.instance === this) ${name}.instance = null;
  }
}
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

interface EventSubscription {
  event: string;
  callback: EventCallback;
}

/**
 * Custom EventBus implementation for game events.
 * Rogue Engine provides lifecycle hooks (RE.onUpdate, etc.) but no generic event system.
 * This EventManager provides pub/sub functionality for custom game events.
 */
export default class ${name} extends RE.Component {
  // Event storage: event name -> list of callbacks
  private static events: Map<string, EventCallback[]> = new Map();

  // Track subscriptions for this instance (for cleanup)
  private subscriptions: EventSubscription[] = [];

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
   * Subscribe to an event with automatic cleanup
   */
  on(event: string, callback: EventCallback): EventSubscription {
    // Add to global event map
    if (!${name}.events.has(event)) {
      ${name}.events.set(event, []);
    }
    ${name}.events.get(event)!.push(callback);

    // Track subscription for cleanup
    const subscription: EventSubscription = { event, callback };
    this.subscriptions.push(subscription);

    return subscription;
  }

  /**
   * Emit an event to all subscribers
   */
  emit(event: string, ...args: any[]) {
    ${name}.emitEvent(event, ...args);
  }

  /**
   * Static emit - can be called without instance
   */
  static emitEvent(event: string, ...args: any[]) {
    const callbacks = ${name}.events.get(event);
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          callback(...args);
        } catch (e) {
          RE.Debug.logError(\`Error in event '\${event}': \${e}\`);
        }
      }
    }
  }

  /**
   * Unsubscribe a specific subscription
   */
  off(subscription: EventSubscription) {
    const callbacks = ${name}.events.get(subscription.event);
    if (callbacks) {
      const index = callbacks.indexOf(subscription.callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }

    // Remove from tracked subscriptions
    const subIndex = this.subscriptions.indexOf(subscription);
    if (subIndex !== -1) {
      this.subscriptions.splice(subIndex, 1);
    }
  }

  /**
   * Unsubscribe all listeners for a specific event
   */
  offAll(event: string) {
    const toRemove = this.subscriptions.filter(s => s.event === event);
    for (const sub of toRemove) {
      this.off(sub);
    }
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
    // Clean up this instance's subscriptions
    for (const sub of this.subscriptions) {
      const callbacks = ${name}.events.get(sub.event);
      if (callbacks) {
        const index = callbacks.indexOf(sub.callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
      }
    }
    this.subscriptions = [];

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
    const currentScene = RE.App.currentScene;
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
  // Game state (select from: menu, playing, paused, gameover)
  @RE.props.select()
  gameState: GameState = "menu";

  // Score tracking
  @RE.props.num()
  score: number = 0;

  @RE.props.num()
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
      // Emit event via callback (implement your own EventBus for complex needs)
      this.onPause?.();
      RE.Debug.log("Game paused");
    }
  }

  resume() {
    if (this.gameState === "paused") {
      this.gameState = "playing";
      // Emit event via callback
      this.onResume?.();
      RE.Debug.log("Game resumed");
    }
  }

  // Event callbacks - assign these from other components
  onPause?: () => void;
  onResume?: () => void;
  onGameOver?: (data: { score: number; highScore: number }) => void;
  onScoreChanged?: (data: { score: number; delta: number }) => void;

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

    // Emit event via callback
    this.onGameOver?.({ score: this.score, highScore: this.highScore });
    RE.Debug.log(\`Game Over! Score: \${this.score}\`);
  }

  // Score management
  addScore(points: number) {
    this.score += points;
    // Emit event via callback
    this.onScoreChanged?.({ score: this.score, delta: points });
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
