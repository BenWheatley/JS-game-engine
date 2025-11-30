/**
 * CollisionDetection - Static utility class for collision detection
 *
 * Responsibilities:
 * - AABB (Axis-Aligned Bounding Box) collision detection
 * - Circle collision detection
 * - Polygon collision detection (SAT - Separating Axis Theorem)
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

  /**
   * Smart collision check - uses polygon if available, otherwise AABB
   * @param {GameEntity} entity1 - First entity
   * @param {GameEntity} entity2 - Second entity
   * @returns {boolean} True if entities are colliding
   */
  static check(entity1, entity2) {
    // If either entity has a collision polygon, use polygon collision
    if (entity1.collisionPolygon || entity2.collisionPolygon) {
      return this.checkPolygonCollision(entity1, entity2);
    }
    // Otherwise use fast AABB
    return this.checkAABB(entity1, entity2);
  }

  /**
   * Check collision between entities (handles polygon vs AABB)
   * @param {GameEntity} entity1 - First entity (may have collisionPolygon)
   * @param {GameEntity} entity2 - Second entity (may have collisionPolygon)
   * @returns {boolean} True if entities are colliding
   */
  static checkPolygonCollision(entity1, entity2) {
    const poly1 = entity1.collisionPolygon
      ? this.transformPolygon(entity1.collisionPolygon, entity1.sprite.position, entity1.sprite.rotation)
      : this.aabbToPolygon(entity1);

    const poly2 = entity2.collisionPolygon
      ? this.transformPolygon(entity2.collisionPolygon, entity2.sprite.position, entity2.sprite.rotation)
      : this.aabbToPolygon(entity2);

    return this.checkSAT(poly1, poly2);
  }

  /**
   * Transform polygon points from local space to world space
   * @param {Array} localPoints - Array of {x, y} points in local space
   * @param {Vector2D} position - World position
   * @param {number} rotation - Rotation in radians
   * @returns {Array} Transformed points in world space
   */
  static transformPolygon(localPoints, position, rotation) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    return localPoints.map(point => {
      // Rotate point
      const rotatedX = point.x * cos - point.y * sin;
      const rotatedY = point.x * sin + point.y * cos;

      // Translate to world position
      return {
        x: rotatedX + position.x,
        y: rotatedY + position.y
      };
    });
  }

  /**
   * Convert AABB to polygon (4 corners)
   * @param {GameEntity} entity - Entity with sprite.position and sprite.size
   * @returns {Array} Array of 4 corner points
   */
  static aabbToPolygon(entity) {
    const pos = entity.sprite.position;
    const halfW = entity.sprite.size.x / 2;
    const halfH = entity.sprite.size.y / 2;

    return [
      {x: pos.x - halfW, y: pos.y - halfH},
      {x: pos.x + halfW, y: pos.y - halfH},
      {x: pos.x + halfW, y: pos.y + halfH},
      {x: pos.x - halfW, y: pos.y + halfH}
    ];
  }

  /**
   * Separating Axis Theorem (SAT) collision detection
   * @param {Array} poly1 - First polygon (array of {x, y} points)
   * @param {Array} poly2 - Second polygon (array of {x, y} points)
   * @returns {boolean} True if polygons are colliding
   */
  static checkSAT(poly1, poly2) {
    // Test axes from both polygons
    if (!this.testSeparatingAxes(poly1, poly2)) return false;
    if (!this.testSeparatingAxes(poly2, poly1)) return false;
    return true;
  }

  /**
   * Test all axes of polygon1 for separation
   * @param {Array} poly1 - Polygon to get axes from
   * @param {Array} poly2 - Polygon to test against
   * @returns {boolean} True if no separating axis found (possible collision)
   */
  static testSeparatingAxes(poly1, poly2) {
    for (let i = 0; i < poly1.length; i++) {
      const p1 = poly1[i];
      const p2 = poly1[(i + 1) % poly1.length];

      // Get edge normal (perpendicular to edge)
      const edge = {x: p2.x - p1.x, y: p2.y - p1.y};
      const axis = {x: -edge.y, y: edge.x}; // Perpendicular

      // Project both polygons onto this axis
      const proj1 = this.projectPolygon(poly1, axis);
      const proj2 = this.projectPolygon(poly2, axis);

      // Check if projections overlap
      if (proj1.max < proj2.min || proj2.max < proj1.min) {
        return false; // Found separating axis - no collision
      }
    }
    return true; // No separating axis found
  }

  /**
   * Project polygon onto axis and return min/max
   * @param {Array} polygon - Polygon to project
   * @param {Object} axis - Axis {x, y} to project onto
   * @returns {Object} {min, max} projection bounds
   */
  static projectPolygon(polygon, axis) {
    let min = Infinity;
    let max = -Infinity;

    for (const point of polygon) {
      // Dot product = projection onto axis
      const projection = point.x * axis.x + point.y * axis.y;
      min = Math.min(min, projection);
      max = Math.max(max, projection);
    }

    return {min, max};
  }
}

export { CollisionDetection };
