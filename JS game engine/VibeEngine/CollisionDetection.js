/**
 * CollisionDetection - Static utility class for collision detection
 *
 * Responsibilities:
 * - AABB (Axis-Aligned Bounding Box) collision detection
 * - Circle collision detection
 * - Centralized collision logic for all entity types
 */
class CollisionDetection {
  /**
   * Checks AABB collision between two entities
   * Used for most entity-entity collisions (player, NPCs, projectiles)
   * @param {GameEntity} entity1 - First entity
   * @param {GameEntity} entity2 - Second entity
   * @returns {boolean} True if entities are colliding
   */
  static checkAABB(entity1, entity2) {
    const pos1 = entity1.sprite.position;
    const size1 = entity1.sprite.size;
    const pos2 = entity2.sprite.position;
    const size2 = entity2.sprite.size;

    // AABB collision: check if rectangles overlap
    return (
      pos1.x - size1.x/2 < pos2.x + size2.x/2 &&
      pos1.x + size1.x/2 > pos2.x - size2.x/2 &&
      pos1.y - size1.y/2 < pos2.y + size2.y/2 &&
      pos1.y + size1.y/2 > pos2.y - size2.y/2
    );
  }

  /**
   * Checks circle collision between two entities
   * Used for circular entities like wormholes
   * @param {Object} entity1 - First entity (must have position and size)
   * @param {Object} entity2 - Second entity (must have sprite.position and sprite.size)
   * @param {number} radiusScale - Scale factor for collision radius (default: 3)
   * @returns {boolean} True if entities are colliding
   */
  static checkCircle(entity1, entity2, radiusScale = 3) {
    const pos1 = entity1.position || entity1.sprite.position;
    const size1 = entity1.size || entity1.sprite.size;
    const pos2 = entity2.sprite.position;
    const size2 = entity2.sprite.size;

    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const collisionRadius = (size1.x + size2.x) / radiusScale;

    return distance < collisionRadius;
  }
}

export { CollisionDetection };
