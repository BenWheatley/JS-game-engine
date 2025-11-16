/**
 * AlienSaucer - Flying saucer enemy with ease-in-out movement
 *
 * Behavior:
 * - Picks a random target location
 * - Smoothly moves to target with ease-in-out interpolation
 * - Stops completely for 2 seconds at target
 * - Repeats
 */
class AlienSaucer extends NPC {
  static States = {
    MOVING: 'moving',
    STOPPED: 'stopped'
  };

  constructor(playerPosition, canvasWidth, canvasHeight) {
    const config = GameConfig.ALIEN_SAUCER;
    const size = new Vector2D(config.WIDTH, config.HEIGHT);

    // Calculate spawn position (2x bounding box offscreen)
    const margin = size.x * GameConfig.SHARED.SPAWN_MARGIN_MULTIPLIER;
    const position = AlienSaucer.getRandomSpawnPosition(
      canvasWidth,
      canvasHeight,
      margin,
      playerPosition
    );

    super(position);
    // Override sprite with correct image
    this.sprite = new Sprite(config.IMAGE_URL, position, size);
    this.sprite.rotation = 0;
    this.velocity = new Vector2D(0, 0); // Always zero velocity (uses interpolation instead)
    this.health = config.HEALTH;
    this.scoreValue = config.SCORE_VALUE;

    // Movement state machine
    this.state = AlienSaucer.States.MOVING;
    this.startPosition = new Vector2D(position.x, position.y);
    this.targetPosition = null;
    this.movementStartTime = 0;
    this.movementDuration = config.MOVEMENT_DURATION;
    this.stopDuration = config.STOP_DURATION;
    this.stoppedElapsed = 0;

    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // Pick initial target
    this.pickNewTarget(playerPosition);
  }

  static getRandomSpawnPosition(canvasWidth, canvasHeight, margin, playerPosition) {
    // Choose random edge (0=top, 1=right, 2=bottom, 3=left)
    const edge = Math.floor(Math.random() * 4);
    let x, y;

    switch(edge) {
      case 0: // Top
        x = playerPosition.x - canvasWidth/2 + Math.random() * canvasWidth;
        y = playerPosition.y - canvasHeight/2 - margin;
        break;
      case 1: // Right
        x = playerPosition.x + canvasWidth/2 + margin;
        y = playerPosition.y - canvasHeight/2 + Math.random() * canvasHeight;
        break;
      case 2: // Bottom
        x = playerPosition.x - canvasWidth/2 + Math.random() * canvasWidth;
        y = playerPosition.y + canvasHeight/2 + margin;
        break;
      case 3: // Left
        x = playerPosition.x - canvasWidth/2 - margin;
        y = playerPosition.y - canvasHeight/2 + Math.random() * canvasHeight;
        break;
    }

    return new Vector2D(x, y);
  }

  /**
   * Smootherstep interpolation for ease-in-out movement
   * @param {number} t - Progress from 0 to 1
   * @returns {number} Interpolated value with smooth acceleration/deceleration
   */
  static smootherstep(t) {
    // Clamp t to [0, 1]
    t = Math.max(0, Math.min(1, t));
    // Smootherstep formula: 6t^5 - 15t^4 + 10t^3
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  pickNewTarget(playerPosition) {
    // Pick a random position within screen bounds relative to player
    const screenHalfWidth = this.canvasWidth / 2;
    const screenHalfHeight = this.canvasHeight / 2;

    const randomX = playerPosition.x + (Math.random() - 0.5) * screenHalfWidth * 1.5;
    const randomY = playerPosition.y + (Math.random() - 0.5) * screenHalfHeight * 1.5;

    this.targetPosition = new Vector2D(randomX, randomY);
    this.startPosition = new Vector2D(this.sprite.position.x, this.sprite.position.y);
    this.movementStartTime = 0; // Will be set on first update in MOVING state
    this.state = AlienSaucer.States.MOVING;
    this.stoppedElapsed = 0;
  }

  update(deltaTime, playerPosition) {
    if (this.state === AlienSaucer.States.MOVING) {
      // Initialize movement start time on first frame of movement
      if (this.movementStartTime === 0) {
        this.movementStartTime = 0;
      }

      this.movementStartTime += deltaTime;
      const elapsed = this.movementStartTime;
      const progress = Math.min(elapsed / this.movementDuration, 1.0);

      // Apply smootherstep interpolation
      const smoothProgress = AlienSaucer.smootherstep(progress);

      // Interpolate position
      const dx = this.targetPosition.x - this.startPosition.x;
      const dy = this.targetPosition.y - this.startPosition.y;

      this.sprite.position.x = this.startPosition.x + dx * smoothProgress;
      this.sprite.position.y = this.startPosition.y + dy * smoothProgress;

      // Update rotation to face direction of movement
      if (progress < 1.0) {
        const angle = Math.atan2(dy, dx);
        this.sprite.rotation = angle + GameConfig.SHARED.SPRITE_UP_ANGLE_OFFSET;
      }

      // Check if movement complete
      if (progress >= 1.0) {
        this.state = AlienSaucer.States.STOPPED;
        this.stoppedElapsed = 0;
        this.sprite.position.x = this.targetPosition.x; // Snap to exact position
        this.sprite.position.y = this.targetPosition.y;
      }
    } else if (this.state === AlienSaucer.States.STOPPED) {
      // Wait at target position
      this.stoppedElapsed += deltaTime;

      if (this.stoppedElapsed >= this.stopDuration) {
        // Pick new target and start moving again
        this.pickNewTarget(playerPosition);
      }
    }

    // Note: Don't call super.update() because we're not using velocity-based movement
  }
}
