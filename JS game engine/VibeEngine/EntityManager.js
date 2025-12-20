/**
 * EntityManager - Manage collections of game entities
 *
 * Responsibilities:
 * - Store and organize entities in named groups
 * - Automatic update/render loops for all entities
 * - Add/remove entities from groups
 * - Query entities by type, position, etc.
 * - Efficient bulk operations
 *
 * Usage:
 * ```javascript
 * const manager = new EntityManager();
 * manager.createGroup('enemies');
 * manager.createGroup('projectiles');
 *
 * manager.add('enemies', new AlienScout());
 * manager.add('projectiles', new Laser());
 *
 * // In update loop:
 * manager.updateAll(deltaTime);
 *
 * // In render loop:
 * manager.renderAll();
 * ```
 */
class EntityManager {
  constructor() {
    this.groups = new Map(); // Map of group name -> array of entities
  }

  /**
   * Create a named group for organizing entities
   * @param {string} groupName - Name of the group (e.g., 'enemies', 'projectiles')
   */
  createGroup(groupName) {
    if (!this.groups.has(groupName)) {
      this.groups.set(groupName, []);
    }
  }

  /**
   * Add an entity to a group
   * @param {string} groupName - Group to add entity to
   * @param {Entity} entity - Entity to add
   */
  add(groupName, entity) {
    if (!this.groups.has(groupName)) {
      this.createGroup(groupName);
    }
    this.groups.get(groupName).push(entity);
  }

  /**
   * Add multiple entities to a group at once
   * @param {string} groupName - Group to add entities to
   * @param {Array<Entity>} entities - Entities to add
   */
  addMultiple(groupName, entities) {
    if (!this.groups.has(groupName)) {
      this.createGroup(groupName);
    }
    this.groups.get(groupName).push(...entities);
  }

  /**
   * Remove an entity from a group
   * @param {string} groupName - Group to remove from
   * @param {Entity} entity - Entity to remove
   * @returns {boolean} True if entity was found and removed
   */
  remove(groupName, entity) {
    const group = this.groups.get(groupName);
    if (!group) return false;

    const index = group.indexOf(entity);
    if (index !== -1) {
      group.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Remove all entities from a group that match a filter function
   * @param {string} groupName - Group to filter
   * @param {Function} filterFn - Function that returns true to REMOVE entity
   * @returns {number} Number of entities removed
   */
  removeWhere(groupName, filterFn) {
    const group = this.groups.get(groupName);
    if (!group) return 0;

    const originalLength = group.length;
    const filtered = group.filter(entity => !filterFn(entity));
    this.groups.set(groupName, filtered);
    return originalLength - filtered.length;
  }

  /**
   * Clear all entities from a group
   * @param {string} groupName - Group to clear
   */
  clearGroup(groupName) {
    const group = this.groups.get(groupName);
    if (group) {
      group.length = 0;
    }
  }

  /**
   * Clear all entities from all groups
   */
  clearAll() {
    for (const group of this.groups.values()) {
      group.length = 0;
    }
  }

  /**
   * Get all entities in a group
   * @param {string} groupName - Group name
   * @returns {Array<Entity>} Array of entities (direct reference, modify carefully)
   */
  getGroup(groupName) {
    return this.groups.get(groupName) || [];
  }

  /**
   * Get entities in a group as a copy (safe for iteration during modification)
   * @param {string} groupName - Group name
   * @returns {Array<Entity>} Copy of entity array
   */
  getGroupCopy(groupName) {
    return [...(this.groups.get(groupName) || [])];
  }

  /**
   * Get count of entities in a group
   * @param {string} groupName - Group name
   * @returns {number} Number of entities in group
   */
  count(groupName) {
    const group = this.groups.get(groupName);
    return group ? group.length : 0;
  }

  /**
   * Get total count of all entities across all groups
   * @returns {number} Total entity count
   */
  countAll() {
    let total = 0;
    for (const group of this.groups.values()) {
      total += group.length;
    }
    return total;
  }

  /**
   * Update all entities in all groups
   * @param {number} deltaTime - Time elapsed in milliseconds
   * @param {...any} args - Additional arguments passed to entity.update()
   */
  updateAll(deltaTime, ...args) {
    for (const group of this.groups.values()) {
      for (const entity of group) {
        if (entity.update) {
          entity.update(deltaTime, ...args);
        }
      }
    }
  }

  /**
   * Update all entities in a specific group
   * @param {string} groupName - Group to update
   * @param {number} deltaTime - Time elapsed in milliseconds
   * @param {...any} args - Additional arguments passed to entity.update()
   */
  updateGroup(groupName, deltaTime, ...args) {
    const group = this.groups.get(groupName);
    if (group) {
      for (const entity of group) {
        if (entity.update) {
          entity.update(deltaTime, ...args);
        }
      }
    }
  }

  /**
   * Render all entities in all groups
   */
  renderAll() {
    for (const group of this.groups.values()) {
      for (const entity of group) {
        if (entity.draw) {
          entity.draw();
        }
      }
    }
  }

  /**
   * Render all entities in a specific group
   * @param {string} groupName - Group to render
   */
  renderGroup(groupName) {
    const group = this.groups.get(groupName);
    if (group) {
      for (const entity of group) {
        if (entity.draw) {
          entity.draw();
        }
      }
    }
  }

  /**
   * Find first entity in a group that matches a predicate
   * @param {string} groupName - Group to search
   * @param {Function} predicateFn - Function that returns true for desired entity
   * @returns {Entity|undefined} First matching entity or undefined
   */
  find(groupName, predicateFn) {
    const group = this.groups.get(groupName);
    return group ? group.find(predicateFn) : undefined;
  }

  /**
   * Find all entities in a group that match a predicate
   * @param {string} groupName - Group to search
   * @param {Function} predicateFn - Function that returns true for desired entities
   * @returns {Array<Entity>} Array of matching entities
   */
  findAll(groupName, predicateFn) {
    const group = this.groups.get(groupName);
    return group ? group.filter(predicateFn) : [];
  }

  /**
   * Execute a callback for each entity in a group
   * @param {string} groupName - Group to iterate
   * @param {Function} callback - Function to call for each entity (entity, index)
   */
  forEach(groupName, callback) {
    const group = this.groups.get(groupName);
    if (group) {
      group.forEach(callback);
    }
  }

  /**
   * Execute a callback for each entity in all groups
   * @param {Function} callback - Function to call for each entity (entity, groupName, index)
   */
  forEachAll(callback) {
    for (const [groupName, group] of this.groups.entries()) {
      group.forEach((entity, index) => callback(entity, groupName, index));
    }
  }

  /**
   * Get all group names
   * @returns {Array<string>} Array of group names
   */
  getGroupNames() {
    return Array.from(this.groups.keys());
  }

  /**
   * Check if a group exists
   * @param {string} groupName - Group name to check
   * @returns {boolean} True if group exists
   */
  hasGroup(groupName) {
    return this.groups.has(groupName);
  }

  /**
   * Check if a group is empty
   * @param {string} groupName - Group name to check
   * @returns {boolean} True if group is empty or doesn't exist
   */
  isEmpty(groupName) {
    const group = this.groups.get(groupName);
    return !group || group.length === 0;
  }
}

export { EntityManager };
