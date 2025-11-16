class NPC extends GameEntity {
  static imageUrl = 'player-ship.png'; // placeholder image; if you see this in the game, should be clear it's not the player
  static size = new Vector2D(42, 43);
  static health = 100;

  constructor(position) {
    super(position, 0, new Vector2D(0, 0), NPC.size, NPC.imageUrl);
    this.health = NPC.health;
    this.scoreValue = 0; // Set by subclasses
  }

  pickNewTarget(playerPosition) {
    this.targetPosition = NPCAIUtils.pickTargetNearPlayer(
      playerPosition,
      this.canvasWidth,
      this.canvasHeight
    );
  }

  /**
   * Handle being hit by damage
   * Override in subclasses for custom behavior
   * @param {number} damage - Amount of damage taken
   * @returns {Object} Hit result with {destroyed, sound, volume, spawns, particleColor}
   */
  onHit(damage) {
    // Default behavior: single-hit enemy
    return {
      destroyed: true,
      sound: null,
      volume: 0,
      spawns: null,
      particleColor: null
    };
  }

  /**
   * Handle collision with player
   * Override in subclasses for custom behavior
   * @returns {Object} Collision result with {damage, sound, volume, particleColor}
   */
  onCollideWithPlayer() {
    // Default behavior: use health as damage, no special effects
    return {
      damage: this.health,
      sound: 'hit',
      volume: 0.6,
      particleColor: null
    };
  }
}
