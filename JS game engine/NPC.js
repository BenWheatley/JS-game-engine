class NPC extends GameEntity {
  static imageUrl = 'player-ship.png'; // placeholder image; if you see this in the game, should be clear it's not the player
  static size = new Vector2D(42, 43);
  static health = 100;

  constructor(position, playerPosition, canvasWidth, canvasHeight, config) {
    const size = new Vector2D(config.WIDTH, config.HEIGHT);
    super(position, 0, new Vector2D(0, 0), size, config.IMAGE_URL);

    this.sprite.rotation = 0;
    this.velocity = new Vector2D(0, 0); // Start with zero velocity
    this.health = config.HEALTH;
    this.scoreValue = config.SCORE_VALUE;

    // AI state machine
    this.targetPosition = null;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // Pick initial target
    this.pickNewTarget(playerPosition);
  }

  hasReachedTarget() {
    return NPCAIUtils.hasReachedTarget(this.sprite.position, this.targetPosition);
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

  /**
   * Get minimap display information
   * NPCs show as enemies on minimap (red squares)
   * @returns {Object} { color: string, radius: number }
   */
  getMinimapInfo() {
    return {
      color: GameConfig.MINIMAP.ENEMY_COLOR,
      radius: GameConfig.MINIMAP.ENEMY_SIZE_LARGE / 2
    };
  }
}
