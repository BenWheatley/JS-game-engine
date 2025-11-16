/**
 * GameState - Encapsulates all game state and entities
 *
 * Central state management for:
 * - Player and NPCs
 * - Projectiles (player and NPC)
 * - Particle effects
 * - Wormhole
 * - Score, level, and timing
 * - Current game state (menu, playing, paused, game over)
 */
class GameState {
  /**
   * Game state enum values
   */
  static States = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
  };

  /**
   * Creates a new game state manager
   * @param {HTMLCanvasElement} canvas - Game canvas element
   */
  constructor(canvas) {
    this.canvas = canvas;

    // Player and entities
    this.player = new Player();
    this.npcs = [];
    this.playerProjectiles = [];
    this.npcProjectiles = [];
    this.wormhole = null;

    // Systems
    this.particleSystem = new ParticleSystem();
    this.minimap = new Minimap(canvas.width, canvas.height);

    // Game state
    this.currentState = GameState.States.MENU;
    this.score = 0;
    this.currentLevel = 1;

    // Timing
    this.gameTime = 0; // Accumulated deltaTime (pauses when game paused)
    this.lastShotTime = 0; // Game time of last shot
  }

  /**
   * Resets the game state for a new game
   * Spawns first wave
   */
  reset() {
    this.player = new Player();
    this.npcs = [];
    this.playerProjectiles = [];
    this.npcProjectiles = [];
    this.wormhole = null;
    this.particleSystem.clear();
    this.score = 0;
    this.currentLevel = 1;
    this.gameTime = 0;
    this.lastShotTime = 0;

    // Spawn first wave
    SpawnSystem.spawnWave(
      this.currentLevel,
      this.player.sprite.position,
      this.canvas.width,
      this.canvas.height,
      this.npcs
    );
  }

  /**
   * Counts total NPCs currently alive
   * @returns {number} Number of NPCs
   */
  countNPCs() {
    return this.npcs.length;
  }

  /**
   * Advances to the next level
   * Spawns wormhole when all NPCs are cleared
   */
  trySpawnWormhole() {
    if (this.countNPCs() === 0 && !this.wormhole) {
      console.log(`Wave ${this.currentLevel} cleared! Wormhole spawning...`);
      const wormholeSize = 27 * 3;
      const position = SpawnSystem.getOffscreenSpawnPosition(
        this.player.sprite.position,
        this.canvas.width,
        this.canvas.height,
        wormholeSize,
        28 * 3
      );
      this.wormhole = new Wormhole(position);
    }
  }

  /**
   * Advances to next level via wormhole
   * Spawns new wave
   */
  advanceLevel() {
    this.currentLevel++;
    console.log(`Entered wormhole! Advancing to wave ${this.currentLevel}`);
    this.wormhole = null;
    SpawnSystem.spawnWave(
      this.currentLevel,
      this.player.sprite.position,
      this.canvas.width,
      this.canvas.height,
      this.npcs
    );
  }
}
