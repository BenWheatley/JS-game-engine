/**
 * SpawnSystem - Handles wave-based enemy and asteroid spawning
 *
 * Responsibilities:
 * - Wave definition scaling based on level
 * - Uniform off-screen spawn position calculation
 * - NPC instantiation and placement
 */
class SpawnSystem {
  /**
   * Gets the wave definition for a given level
   * Scales up exponentially for levels beyond defined waves
   * @param {number} level - The wave level (1-based)
   * @returns {Object} Wave definition with spawn counts
   */
  static getWaveDefinition(level) {
    const waveIndex = Math.min(level - 1, GameConfig.SPAWNING.MAX_LEVEL_INDEX);
    const baseWave = GameConfig.SPAWNING.WAVES[waveIndex];

    // If level exceeds wave definitions, scale up the last wave
    if (level > GameConfig.SPAWNING.WAVES.length) {
      const levelsOver = level - GameConfig.SPAWNING.WAVES.length;
      const scaleFactor = Math.pow(GameConfig.SPAWNING.SCALING_FACTOR, levelsOver);
      return {
        alienScouts: Math.floor(baseWave.alienScouts * scaleFactor),
        alienFighters: Math.floor(baseWave.alienFighters * scaleFactor),
        missileCruisers: Math.floor(baseWave.missileCruisers * scaleFactor),
        alienSaucers: Math.floor((baseWave.alienSaucers || 0) * scaleFactor),
        asteroids: Math.floor(baseWave.asteroids * scaleFactor)
      };
    }

    return baseWave;
  }

  /**
   * Calculates a random spawn position outside the screen but within warp boundary
   * Uses area-weighted rectangular strips for uniform distribution
   * @param {Vector2D} playerPos - Player position (world center)
   * @param {number} canvasWidth - Canvas width in pixels
   * @param {number} canvasHeight - Canvas height in pixels
   * @param {number} npcWidth - NPC width in pixels
   * @param {number} npcHeight - NPC height in pixels
   * @returns {Vector2D} Spawn position in world coordinates
   */
  static getOffscreenSpawnPosition(playerPos, canvasWidth, canvasHeight, npcWidth, npcHeight) {
    // Spawn uniformly in rectangular region: outside screen, inside warp boundary
    const screenHalfWidth = canvasWidth / 2;
    const screenHalfHeight = canvasHeight / 2;
    const npcHalfWidth = npcWidth / 2;
    const npcHalfHeight = npcHeight / 2;

    // Inner bounds (screen + NPC size)
    const innerX = screenHalfWidth + npcHalfWidth;
    const innerY = screenHalfHeight + npcHalfHeight;

    // Outer bounds (warp boundary)
    const outerBound = GameConfig.WORLD.NPC_WRAP_DISTANCE;

    // Define 4 rectangular strips: top, bottom, left, right
    const topArea = (2 * outerBound) * (outerBound - innerY);
    const bottomArea = topArea;
    const leftArea = (outerBound - innerX) * (2 * innerY);
    const rightArea = leftArea;
    const totalArea = topArea + bottomArea + leftArea + rightArea;

    // Pick strip based on area
    const r = Math.random() * totalArea;
    let x, y;

    if (r < topArea) {
      // Top strip
      x = -outerBound + Math.random() * (2 * outerBound);
      y = innerY + Math.random() * (outerBound - innerY);
    } else if (r < topArea + bottomArea) {
      // Bottom strip
      x = -outerBound + Math.random() * (2 * outerBound);
      y = -outerBound + Math.random() * (outerBound - innerY);
    } else if (r < topArea + bottomArea + leftArea) {
      // Left strip
      x = -outerBound + Math.random() * (outerBound - innerX);
      y = -innerY + Math.random() * (2 * innerY);
    } else {
      // Right strip
      x = innerX + Math.random() * (outerBound - innerX);
      y = -innerY + Math.random() * (2 * innerY);
    }

    return new Vector2D(playerPos.x + x, playerPos.y + y);
  }

  /**
   * Spawns a complete wave of NPCs for the given level
   * @param {number} level - Wave level (1-based)
   * @param {Vector2D} playerPos - Player position for spawn calculations
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {Array} npcsArray - Array to push spawned NPCs into
   */
  static spawnWave(level, playerPos, canvasWidth, canvasHeight, npcsArray) {
    const wave = SpawnSystem.getWaveDefinition(level);

    DebugLogger.log(`Spawning Wave ${level}:`, wave);

    // Spawn alien scouts
    for (let i = 0; i < wave.alienScouts; i++) {
      const position = SpawnSystem.getOffscreenSpawnPosition(playerPos, canvasWidth, canvasHeight,
        GameConfig.ALIEN_SCOUT.WIDTH, GameConfig.ALIEN_SCOUT.HEIGHT);
      const scout = new AlienScout(playerPos, canvasWidth, canvasHeight);
      scout.sprite.position = position;
      npcsArray.push(scout);
    }

    // Spawn alien fighters
    for (let i = 0; i < wave.alienFighters; i++) {
      const position = SpawnSystem.getOffscreenSpawnPosition(playerPos, canvasWidth, canvasHeight,
        GameConfig.ALIEN_FIGHTER.WIDTH, GameConfig.ALIEN_FIGHTER.HEIGHT);
      const fighter = new AlienFighter(playerPos, canvasWidth, canvasHeight);
      fighter.sprite.position = position;
      npcsArray.push(fighter);
    }

    // Spawn missile cruisers
    for (let i = 0; i < wave.missileCruisers; i++) {
      const position = SpawnSystem.getOffscreenSpawnPosition(playerPos, canvasWidth, canvasHeight,
        GameConfig.MISSILE_CRUISER.WIDTH, GameConfig.MISSILE_CRUISER.HEIGHT);
      const cruiser = new MissileCruiser(playerPos, canvasWidth, canvasHeight);
      cruiser.sprite.position = position;
      npcsArray.push(cruiser);
    }

    // Spawn alien saucers
    for (let i = 0; i < (wave.alienSaucers || 0); i++) {
      const position = SpawnSystem.getOffscreenSpawnPosition(playerPos, canvasWidth, canvasHeight,
        GameConfig.ALIEN_SAUCER.WIDTH, GameConfig.ALIEN_SAUCER.HEIGHT);
      const saucer = new AlienSaucer(playerPos, canvasWidth, canvasHeight);
      saucer.sprite.position = position;
      npcsArray.push(saucer);
    }

    // Spawn asteroids
    for (let i = 0; i < wave.asteroids; i++) {
      const position = SpawnSystem.getOffscreenSpawnPosition(playerPos, canvasWidth, canvasHeight,
        GameConfig.ASTEROID_BIG.WIDTH, GameConfig.ASTEROID_BIG.HEIGHT);
      const asteroid = new Asteroid(playerPos, canvasWidth, canvasHeight);
      asteroid.sprite.position = position;
      npcsArray.push(asteroid);
    }
  }
}
