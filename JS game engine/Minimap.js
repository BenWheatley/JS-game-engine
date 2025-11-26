/**
 * Minimap - Displays a radar-style minimap showing player, enemies, and asteroids
 *
 * The minimap shows entities within a certain range of the player, positioned
 * relative to the player's location in the center of the minimap.
 */
import { Vector2D } from './VibeEngine.js';
import { GameConfig } from './GameConfig.js';

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
   * Draws all NPCs on the minimap (enemies, asteroids, etc.)
   * @param {CanvasRenderingContext2D} context - Canvas rendering context
   * @param {Array} npcs - Array of all NPCs
   * @param {Vector2D} playerPos - Player position
   */
  drawNPCs(context, npcs, playerPos) {
    for (const npc of npcs) {
      const info = npc.getMinimapInfo();
      // Only draw if color is specified (null means don't render)
      if (info.color) {
        const pos = this.worldToMinimap(npc.sprite.position, playerPos);
        if (this.isOnMinimap(pos)) {
          context.fillStyle = info.color;
          context.fillRect(
            pos.x - info.radius,
            pos.y - info.radius,
            info.radius * 2,
            info.radius * 2
          );
        }
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
   * Draws the wormhole on the minimap
   * @param {CanvasRenderingContext2D} context - Canvas rendering context
   * @param {Wormhole} wormhole - The wormhole entity
   * @param {Vector2D} playerPos - Player position
   */
  drawWormhole(context, wormhole, playerPos) {
    if (!wormhole) return;

    const pos = this.worldToMinimap(wormhole.position, playerPos);
    if (this.isOnMinimap(pos)) {
      context.strokeStyle = '#FFFFFF'; // White
      context.lineWidth = 1;
      context.beginPath();
      context.arc(pos.x, pos.y, 4, 0, Math.PI * 2); // 8px diameter = 4px radius
      context.stroke();
    }
  }

  /**
   * Draws the complete minimap
   * @param {CanvasRenderingContext2D} context - Canvas rendering context
   * @param {Object} entities - Object containing npcs array and wormhole
   * @param {Vector2D} playerPos - Player position
   */
  draw(context, entities, playerPos) {
    // Save current context state (including clipping)
    context.save();

    // Define clipping region
    context.beginPath();
    context.rect(this.x, this.y, this.size, this.size);
    context.clip();

    // Draw background (without border)
    context.fillStyle = GameConfig.MINIMAP.BACKGROUND_COLOR;
    context.fillRect(this.x, this.y, this.size, this.size);

    // Draw entities
    this.drawNPCs(context, entities.npcs, playerPos);
    this.drawWormhole(context, entities.wormhole, playerPos);
    this.drawPlayer(context);

    // Restore context: clipping is removed
    context.restore();

    // Draw border last (on top)
    context.strokeStyle = GameConfig.MINIMAP.BORDER_COLOR;
    context.lineWidth = GameConfig.MINIMAP.BORDER_WIDTH;
    context.strokeRect(this.x, this.y, this.size, this.size);
  }
}

export { Minimap };
