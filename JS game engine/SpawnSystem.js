/**
 * SpawnSystem - Handles wave-based enemy and asteroid spawning
 *
 * Responsibilities:
 * - Wave definition scaling based on level
 * - Uniform off-screen spawn position calculation
 * - Dynamic NPC instantiation using config-driven entity types
 */
import { Vector2D, DebugLogger } from './VibeEngine/VibeEngine.js';
import { GameConfig } from './GameConfig.js';

class SpawnSystem {
  /**
   * Gets the wave definition for a given level
   * Scales up exponentially for levels beyond defined waves
   * @param {number} level - The wave level (1-based)
   * @returns {Object} Wave definition with spawn counts
   */
  static getWaveDefinition(level) {
    const maxIndex = GameConfig.SPAWNING.WAVES.length - 1;
    const waveIndex = Math.min(level - 1, maxIndex);
    const baseWave = GameConfig.SPAWNING.WAVES[waveIndex];

    // If level exceeds wave definitions, scale up the last wave
    if (level > GameConfig.SPAWNING.WAVES.length) {
      const levelsOver = level - GameConfig.SPAWNING.WAVES.length;
      const scaleFactor = Math.pow(GameConfig.SPAWNING.SCALING_FACTOR, levelsOver);

      // Scale all entity types dynamically
      const scaledWave = {};
      for (const entityType in baseWave) {
        scaledWave[entityType] = Math.floor(baseWave[entityType] * scaleFactor);
      }
      return scaledWave;
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
   * Uses dynamic class instantiation based on GameConfig.SPAWNING.ENTITY_TYPES
   * @param {number} level - Wave level (1-based)
   * @param {Vector2D} playerPos - Player position for spawn calculations
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {Array} npcsArray - Array to push spawned NPCs into
   */
  static spawnWave(level, playerPos, canvasWidth, canvasHeight, npcsArray) {
    const wave = SpawnSystem.getWaveDefinition(level);

    DebugLogger.log(`Spawning Wave ${level}:`, wave);

    // Dynamically spawn all entity types defined in the wave
    for (const [entityType, count] of Object.entries(wave)) {
      const entityDef = GameConfig.SPAWNING.ENTITY_TYPES[entityType];

      // Skip if entity type not defined in ENTITY_TYPES map
      if (!entityDef) {
        DebugLogger.warn(`Unknown entity type: ${entityType}`);
        continue;
      }

      // Get config for this entity type
      const entityConfig = GameConfig[entityDef.config];

      // Spawn the specified count
      for (let i = 0; i < count; i++) {
        const position = SpawnSystem.getOffscreenSpawnPosition(
          playerPos,
          canvasWidth,
          canvasHeight,
          entityConfig.WIDTH,
          entityConfig.HEIGHT
        );

        // Instantiate using the class reference from config
        const entity = new entityDef.class(position, playerPos, canvasWidth, canvasHeight);
        npcsArray.push(entity);
      }
    }
  }
}

export { SpawnSystem };
