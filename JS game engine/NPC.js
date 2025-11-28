import { GameEntity } from './GameEntity.js';
import { Vector2D, Sprite } from './VibeEngine/VibeEngine.js';
import { GameConfig } from './GameConfig.js';
import { NPCAIUtils } from './NPCAIUtils.js';

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
    this.maxHealth = config.HEALTH;
    this.scoreValue = config.SCORE_VALUE;

    // Store config reference for movement parameters
    this.config = config;

    // Store config for onHit/onCollideWithPlayer
    this.hitSound = config.HIT_SOUND;
    this.hitVolume = config.HIT_VOLUME;
    this.destroyedSound = config.DESTROYED_SOUND;
    this.destroyedVolume = config.DESTROYED_VOLUME;
    this.particleColor = config.PARTICLE_COLOR;
    this.collisionSound = config.COLLISION_SOUND;
    this.collisionVolume = config.COLLISION_VOLUME;
    this.rotationalSpeed = config.ROTATIONAL_SPEED;

    // Health bar configuration
    this.showHealthBar = config.SHOW_HEALTH_BAR || false;

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

  turnTowards(targetAngle, deltaTime) {
    // Calculate normalized angle difference using Vector2D utility
    const angleDiff = Vector2D.normalizeAngleDiff(targetAngle, this.sprite.rotation);

    // Turn in the direction of smallest angle difference
    if (Math.abs(angleDiff) > GameConfig.NPC.TURN_PRECISION) {
      if (angleDiff > 0) {
        this.sprite.rotation += Math.min(this.rotationalSpeed * deltaTime, angleDiff);
      } else {
        this.sprite.rotation -= Math.min(this.rotationalSpeed * deltaTime, -angleDiff);
      }
    }
  }

  /**
   * Accelerate forward based on config values
   * Subclasses can override if they need different acceleration logic
   * @param {number} deltaTime - Time delta in milliseconds
   */
  accelerate(deltaTime) {
    if (!this.config.FORWARD_ACCELERATION) return;

    const accelerationVector = Vector2D.fromRadial(this.sprite.rotation, 1).mul(this.config.FORWARD_ACCELERATION);
    const velocityChange = accelerationVector.mul(deltaTime);
    this.velocity = this.velocity.add(velocityChange);
    this.clampSpeed();
  }

  /**
   * Clamp speed to max speed from config
   * Subclasses can override if they need different speed clamping logic
   */
  clampSpeed() {
    if (!this.config.MAX_SPEED) return;

    const speed = this.velocity.mag();
    if (speed > this.config.MAX_SPEED) {
      this.velocity = this.velocity.norm().mul(this.config.MAX_SPEED);
    }
  }

  /**
   * Handle being hit by damage
   * Multi-hit NPCs - reduce health and check if destroyed
   * @param {number} damage - Amount of damage taken
   * @returns {Object} Hit result with {destroyed, sound, volume, spawns, particleColor}
   */
  onHit(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      return {
        destroyed: true,
        sound: this.destroyedSound,
        volume: this.destroyedVolume,
        spawns: null,
        particleColor: this.particleColor
      };
    } else {
      return {
        destroyed: false,
        sound: this.hitSound,
        volume: this.hitVolume,
        spawns: null,
        particleColor: null
      };
    }
  }

  /**
   * Handle collision with player
   * @returns {Object} Collision result with {damage, sound, volume, particleColor}
   */
  onCollideWithPlayer() {
    return {
      damage: this.health,
      sound: this.collisionSound,
      volume: this.collisionVolume,
      particleColor: this.particleColor
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

  /**
   * Draw the NPC sprite and optional health bar
   */
  draw() {
    // Draw sprite first
    super.draw();

    // Draw health bar if enabled
    if (this.showHealthBar) {
      const context = Sprite._context;
      if (!context) return;

      const healthPercentage = Math.max(0, Math.min(1, this.health / this.maxHealth));

      const barWidth = 60;
      const barHeight = 6;
      const barX = this.sprite.position.x - barWidth / 2;
      const barY = this.sprite.position.y - this.sprite.size.y / 2 - 12; // 12 pixels above sprite

      // Draw background (red - shows damage)
      context.fillStyle = GameConfig.HUD.HEALTH_BAR_BG_COLOR;
      context.fillRect(barX, barY, barWidth, barHeight);

      // Draw foreground (green - shows current health)
      const currentHealthWidth = barWidth * healthPercentage;
      context.fillStyle = GameConfig.HUD.HEALTH_BAR_FG_COLOR;
      context.fillRect(barX, barY, currentHealthWidth, barHeight);

      // Draw border (white)
      context.strokeStyle = GameConfig.HUD.HEALTH_BAR_BORDER_COLOR;
      context.lineWidth = 1;
      context.strokeRect(barX, barY, barWidth, barHeight);
    }
  }
}

export { NPC };
