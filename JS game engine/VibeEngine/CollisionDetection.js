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
   * Used for circular entities like wormholes (legacy method with radiusScale)
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
   * Exact circle vs circle collision detection
   * @param {Object} entity1 - First entity (must have radius and sprite.position)
   * @param {Object} entity2 - Second entity (must have radius and sprite.position)
   * @returns {boolean} True if circles are colliding
   */
  static checkCircleCircle(entity1, entity2) {
    const pos1 = entity1.sprite.position;
    const pos2 = entity2.sprite.position;
    const radius1 = entity1.radius;
    const radius2 = entity2.radius;

    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const distanceSquared = dx * dx + dy * dy;
    const radiusSum = radius1 + radius2;

    return distanceSquared < radiusSum * radiusSum;
  }

  /**
   * Exact circle vs AABB collision detection
   * @param {Object} circle - Circle entity (must have radius and sprite.position)
   * @param {Object} aabb - AABB entity (must have sprite.position and sprite.size)
   * @returns {boolean} True if circle and AABB are colliding
   */
  static checkCircleAABB(circle, aabb) {
    const circlePos = circle.sprite.position;
    const radius = circle.radius;
    const aabbPos = aabb.sprite.position;
    const aabbSize = aabb.sprite.size;

    // Find the closest point on the AABB to the circle center
    const halfWidth = aabbSize.x / 2;
    const halfHeight = aabbSize.y / 2;

    const closestX = Math.max(
      aabbPos.x - halfWidth,
      Math.min(circlePos.x, aabbPos.x + halfWidth)
    );
    const closestY = Math.max(
      aabbPos.y - halfHeight,
      Math.min(circlePos.y, aabbPos.y + halfHeight)
    );

    // Calculate distance from circle center to closest point
    const dx = circlePos.x - closestX;
    const dy = circlePos.y - closestY;
    const distanceSquared = dx * dx + dy * dy;

    return distanceSquared < radius * radius;
  }

  /**
   * Exact circle vs polygon collision detection
   * @param {Object} circle - Circle entity (must have radius and sprite.position)
   * @param {Object} polygon - Polygon entity (must have collisionPolygon, sprite.position, sprite.rotation)
   * @returns {boolean} True if circle and polygon are colliding
   */
  static checkCirclePolygon(circle, polygon) {
    const circlePos = circle.sprite.position;
    const radius = circle.radius;

    // Transform polygon to world space
    const worldPolygon = this.transformPolygon(
      polygon.collisionPolygon,
      polygon.sprite.position,
      polygon.sprite.rotation
    );

    // Check 1: Is circle center inside polygon?
    if (this.pointInPolygon(circlePos, worldPolygon)) {
      return true;
    }

    // Check 2: Does circle intersect any edge of the polygon?
    for (let i = 0; i < worldPolygon.length; i++) {
      const p1 = worldPolygon[i];
      const p2 = worldPolygon[(i + 1) % worldPolygon.length];

      if (this.circleIntersectsLineSegment(circlePos, radius, p1, p2)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if a point is inside a polygon using ray casting algorithm
   * @param {Vector2D} point - Point to test
   * @param {Array<Vector2D>} polygon - Array of polygon vertices in world space
   * @returns {boolean} True if point is inside polygon
   */
  static pointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;

      const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  /**
   * Check if a circle intersects a line segment
   * @param {Vector2D} circlePos - Circle center position
   * @param {number} radius - Circle radius
   * @param {Vector2D} lineStart - Line segment start point
   * @param {Vector2D} lineEnd - Line segment end point
   * @returns {boolean} True if circle intersects line segment
   */
  static circleIntersectsLineSegment(circlePos, radius, lineStart, lineEnd) {
    // Vector from line start to circle center
    const dx = circlePos.x - lineStart.x;
    const dy = circlePos.y - lineStart.y;

    // Vector along the line segment
    const lineDx = lineEnd.x - lineStart.x;
    const lineDy = lineEnd.y - lineStart.y;

    // Length squared of line segment
    const lineLengthSquared = lineDx * lineDx + lineDy * lineDy;

    // Project circle center onto line segment (clamped to [0, 1])
    let t = 0;
    if (lineLengthSquared !== 0) {
      t = Math.max(0, Math.min(1, (dx * lineDx + dy * lineDy) / lineLengthSquared));
    }

    // Find closest point on line segment
    const closestX = lineStart.x + t * lineDx;
    const closestY = lineStart.y + t * lineDy;

    // Distance from circle center to closest point
    const distX = circlePos.x - closestX;
    const distY = circlePos.y - closestY;
    const distanceSquared = distX * distX + distY * distY;

    return distanceSquared <= radius * radius;
  }

  /**
   * Smart collision check - routes to appropriate collision method based on shape types
   * Supports: Polygon, Circle (via radius property), and AABB
   * @param {GameEntity} entity1 - First entity
   * @param {GameEntity} entity2 - Second entity
   * @returns {boolean} True if entities are colliding
   */
  static check(entity1, entity2) {
    const has1Polygon = entity1.collisionPolygon != null;
    const has2Polygon = entity2.collisionPolygon != null;
    const has1Radius = entity1.radius !== undefined;
    const has2Radius = entity2.radius !== undefined;

    // 1. Polygon vs Polygon
    if (has1Polygon && has2Polygon) {
      return this.checkPolygonCollision(entity1, entity2);
    }

    // 2. Circle vs Polygon (exact collision)
    if ((has1Radius && has2Polygon) || (has1Polygon && has2Radius)) {
      const circle = has1Radius ? entity1 : entity2;
      const polygon = has1Polygon ? entity1 : entity2;
      return this.checkCirclePolygon(circle, polygon);
    }

    // 3. Polygon vs AABB (convert AABB to polygon)
    if (has1Polygon || has2Polygon) {
      return this.checkPolygonCollision(entity1, entity2);
    }

    // 4. Circle vs Circle (exact collision)
    if (has1Radius && has2Radius) {
      return this.checkCircleCircle(entity1, entity2);
    }

    // 5. Circle vs AABB (exact collision)
    if (has1Radius || has2Radius) {
      const circle = has1Radius ? entity1 : entity2;
      const aabb = has1Radius ? entity2 : entity1;
      return this.checkCircleAABB(circle, aabb);
    }

    // 6. AABB vs AABB (default)
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
