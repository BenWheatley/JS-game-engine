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
    this.hasFiredThisCycle = false; // Track if we've fired during this stop

    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // Continuous spin rate: 0.5 Hz = 0.5 rotations/second = π radians/second
    this.spinRate = Math.PI / 1000; // radians per millisecond (reduced by 4x)

    // Curved path parameters (set when picking new target)
    this.curveAmplitude = 0;
    this.curvePerpendicular = new Vector2D(0, 0);

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

    // Calculate curved path parameters using Vector2D methods
    const travelVector = this.targetPosition.sub(this.startPosition);
    const distance = travelVector.mag();

    // Amplitude: random between -0.1 and 0.1 of distance
    const amplitudeScale = (Math.random() * 0.2) - 0.1; // Random in [-0.1, 0.1]
    this.curveAmplitude = distance * amplitudeScale;

    // Perpendicular direction (rotate travel direction by 90°)
    // If travel direction is (dx, dy), perpendicular is (-dy, dx) normalized
    if (distance > 0) {
      const travelDir = travelVector.norm();
      this.curvePerpendicular = new Vector2D(-travelDir.y, travelDir.x);
    } else {
      this.curvePerpendicular = new Vector2D(0, 0);
    }

    this.movementStartTime = 0; // Will be set on first update in MOVING state
    this.state = AlienSaucer.States.MOVING;
    this.stoppedElapsed = 0;
    this.hasFiredThisCycle = false; // Reset firing flag for new cycle
  }

  /**
   * Fires a ring of 8 plasma bolts in cardinal and diagonal directions
   * @returns {Array} Array of Plasma projectiles
   */
  fireRing() {
    const shots = [];
    // Fire in 8 directions: 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI / 4); // 0, π/4, π/2, 3π/4, π, 5π/4, 3π/2, 7π/4
      const velocity = Vector2D.fromRadial(angle, Plasma.speed);
      const shot = new Plasma(
        new Vector2D(this.sprite.position.x, this.sprite.position.y),
        velocity
      );
      shots.push(shot);
    }
    return shots;
  }

  /**
   * Check if saucer should fire this frame
   * Fires a ring of 8 plasma bolts 1 second after stopping
   * @param {number} gameTime - Current game time
   * @returns {Object|null} Object with sound, volume, and shots array, or null if not firing
   */
  tryShoot(gameTime) {
    // Fire 1 second after stopping (only once per cycle)
    if (this.state === AlienSaucer.States.STOPPED &&
        !this.hasFiredThisCycle &&
        this.stoppedElapsed >= 1000) {
      this.hasFiredThisCycle = true;
      return {
        sound: GameConfig.ALIEN_SAUCER.SHOOT_SOUND,
        volume: GameConfig.ALIEN_SAUCER.SHOOT_VOLUME,
        shots: this.fireRing()
      };
    }
    return null;
  }

  update(deltaTime, playerPosition) {
    // Continuous spin at 2 Hz regardless of state
    this.sprite.rotation += this.spinRate * deltaTime;

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

      // Interpolate position along straight line using Vector2D methods
      const travelVector = this.targetPosition.sub(this.startPosition);
      const basePosition = this.startPosition.add(travelVector.mul(smoothProgress));

      // Add curved offset perpendicular to travel direction
      // Wavelength = 2x distance means we travel 0.5 wavelengths (π radians)
      // Use sine so curve starts at 0, peaks at middle, returns to 0 at end
      const curveOffset = this.curveAmplitude * Math.sin(progress * Math.PI);
      const offsetVector = this.curvePerpendicular.mul(curveOffset);

      const finalPosition = basePosition.add(offsetVector);
      this.sprite.position.x = finalPosition.x;
      this.sprite.position.y = finalPosition.y;

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
