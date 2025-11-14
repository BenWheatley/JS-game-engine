/**
 * Minimap - Displays a radar-style minimap showing player, enemies, and asteroids
 *
 * The minimap shows entities within a certain range of the player, positioned
 * relative to the player's location in the center of the minimap.
 */
class Minimap {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // Calculate minimap position (top-right corner)
    this.x = canvasWidth - GameConfig.MINIMAP.SIZE - GameConfig.MINIMAP.MARGIN;
    this.y = GameConfig.MINIMAP.MARGIN;
    this.size = GameConfig.MINIMAP.SIZE;

    // Calculate scale factor for world-to-minimap coordinate conversion
    this.scale = this.size / (GameConfig.MINIMAP.RANGE * 2);
  }

  /**
   * Converts world coordinates to minimap screen coordinates
   * @param {Vector2D} worldPos - Position in world space
   * @param {Vector2D} playerPos - Player position (minimap center)
   * @returns {{x: number, y: number}} - Screen coordinates on minimap
   */
  worldToMinimap(worldPos, playerPos) {
    const relativeX = worldPos.x - playerPos.x;
    const relativeY = worldPos.y - playerPos.y;
    const minimapPosX = this.x + this.size/2 + (relativeX * this.scale);
    const minimapPosY = this.y + this.size/2 + (relativeY * this.scale);
    return { x: minimapPosX, y: minimapPosY };
  }

  /**
   * Checks if a minimap position is within the minimap bounds
   * @param {{x: number, y: number}} pos - Minimap screen coordinates
   * @returns {boolean} - True if position is visible on minimap
   */
  isOnMinimap(pos) {
    return pos.x >= this.x &&
           pos.x <= this.x + this.size &&
           pos.y >= this.y &&
           pos.y <= this.y + this.size;
  }

  /**
   * Draws the minimap background and border
   * @param {CanvasRenderingContext2D} context - Canvas rendering context
   */
  drawBackground(context) {
    // Background
    context.fillStyle = GameConfig.MINIMAP.BACKGROUND_COLOR;
    context.fillRect(this.x, this.y, this.size, this.size);

    // Border
    context.strokeStyle = GameConfig.MINIMAP.BORDER_COLOR;
    context.lineWidth = GameConfig.MINIMAP.BORDER_WIDTH;
    context.strokeRect(this.x, this.y, this.size, this.size);
  }

  /**
   * Draws asteroids on the minimap
   * @param {CanvasRenderingContext2D} context - Canvas rendering context
   * @param {Array} asteroids - Array of Asteroid entities
   * @param {Array} asteroidSpawns - Array of AsteroidSpawn entities
   * @param {Vector2D} playerPos - Player position
   */
  drawAsteroids(context, asteroids, asteroidSpawns, playerPos) {
    context.fillStyle = GameConfig.MINIMAP.ASTEROID_COLOR;

    // Large asteroids
    for (const asteroid of asteroids) {
      const pos = this.worldToMinimap(asteroid.sprite.position, playerPos);
      if (this.isOnMinimap(pos)) {
        const halfSize = GameConfig.MINIMAP.ENEMY_SIZE_LARGE / 2;
        context.fillRect(pos.x - halfSize, pos.y - halfSize,
                        GameConfig.MINIMAP.ENEMY_SIZE_LARGE,
                        GameConfig.MINIMAP.ENEMY_SIZE_LARGE);
      }
    }

    // Small asteroid spawns
    for (const asteroidSpawn of asteroidSpawns) {
      const pos = this.worldToMinimap(asteroidSpawn.sprite.position, playerPos);
      if (this.isOnMinimap(pos)) {
        const halfSize = GameConfig.MINIMAP.ENEMY_SIZE_SMALL / 2;
        context.fillRect(pos.x - halfSize, pos.y - halfSize,
                        GameConfig.MINIMAP.ENEMY_SIZE_SMALL,
                        GameConfig.MINIMAP.ENEMY_SIZE_SMALL);
      }
    }
  }

  /**
   * Draws enemies on the minimap
   * @param {CanvasRenderingContext2D} context - Canvas rendering context
   * @param {Array} aliens - Array of Alien entities
   * @param {Array} alienScouts - Array of AlienScout entities
   * @param {Array} alienFighters - Array of AlienFighter entities
   * @param {Array} missileCruisers - Array of MissileCruiser entities
   * @param {Vector2D} playerPos - Player position
   */
  drawEnemies(context, aliens, alienScouts, alienFighters, missileCruisers, playerPos) {
    context.fillStyle = GameConfig.MINIMAP.ENEMY_COLOR;
    const halfSize = GameConfig.MINIMAP.ENEMY_SIZE_LARGE / 2;

    // Draw all enemy types
    const allEnemies = [...aliens, ...alienScouts, ...alienFighters, ...missileCruisers];
    for (const enemy of allEnemies) {
      const pos = this.worldToMinimap(enemy.sprite.position, playerPos);
      if (this.isOnMinimap(pos)) {
        context.fillRect(pos.x - halfSize, pos.y - halfSize,
                        GameConfig.MINIMAP.ENEMY_SIZE_LARGE,
                        GameConfig.MINIMAP.ENEMY_SIZE_LARGE);
      }
    }
  }

  /**
   * Draws the player indicator in the center of the minimap
   * @param {CanvasRenderingContext2D} context - Canvas rendering context
   */
  drawPlayer(context) {
    context.fillStyle = GameConfig.MINIMAP.PLAYER_COLOR;
    context.beginPath();
    context.arc(
      this.x + this.size/2,
      this.y + this.size/2,
      GameConfig.MINIMAP.PLAYER_SIZE,
      0,
      Math.PI * 2
    );
    context.fill();
  }

  /**
   * Draws the complete minimap
   * @param {CanvasRenderingContext2D} context - Canvas rendering context
   * @param {Object} entities - Object containing all entity arrays
   * @param {Vector2D} playerPos - Player position
   */
  draw(context, entities, playerPos) {
    this.drawBackground(context);
    this.drawAsteroids(context, entities.asteroids, entities.asteroidSpawns, playerPos);
    this.drawEnemies(context, entities.aliens, entities.alienScouts,
                    entities.alienFighters, entities.missileCruisers, playerPos);
    this.drawPlayer(context);
  }
}
