/**
 * NPCAIUtils - Shared AI utilities for NPC behavior
 *
 * This module contains common AI logic used across multiple NPC types
 * to avoid code duplication and centralize AI behavior patterns.
 */
import { Vector2D } from './VibeEngine/VibeEngine.js';
import { GameConfig } from './GameConfig.js';

class NPCAIUtils {
  /**
   * Picks a random target position near the player
   * Used by NPCs to select movement destinations
   *
   * @param {Vector2D} playerPosition - Current player position
   * @param {number} canvasWidth - Canvas width for screen radius calculation
   * @param {number} canvasHeight - Canvas height for screen radius calculation
   * @returns {Vector2D} Random target position near player
   */
  static pickTargetNearPlayer(playerPosition, canvasWidth, canvasHeight) {
    // Pick a random location near the player (within screen bounds if player doesn't move)
    const screenRadius = Math.min(canvasWidth, canvasHeight) / 2;
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * screenRadius * GameConfig.NPC.TARGET_AREA_FACTOR;

    return new Vector2D(
      playerPosition.x + Math.cos(angle) * distance,
      playerPosition.y + Math.sin(angle) * distance
    );
  }

  /**
   * Checks if an NPC has reached its target position
   *
   * @param {Vector2D} currentPosition - NPC's current position
   * @param {Vector2D} targetPosition - Target position (may be null)
   * @returns {boolean} True if target reached or no target exists
   */
  static hasReachedTarget(currentPosition, targetPosition) {
    if (!targetPosition) return false;
    const distance = currentPosition.dist(targetPosition);
    return distance < GameConfig.NPC.ARRIVAL_THRESHOLD;
  }
}

export { NPCAIUtils };
