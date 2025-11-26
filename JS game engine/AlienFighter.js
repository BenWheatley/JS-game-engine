import { NPC } from './NPC.js';
import { GameConfig } from './GameConfig.js';
import { Plasma } from './Plasma.js';
import { NPCAIUtils } from './NPCAIUtils.js';

class AlienFighter extends NPC {
  constructor(position, playerPosition, canvasWidth, canvasHeight) {
    super(position, playerPosition, canvasWidth, canvasHeight, GameConfig.ALIEN_FIGHTER);

    // Shooting state (uses game time, not wall-clock time)
    this.lastShotTime = 0;
    this.shots = []; // Track shots fired by this fighter
  }

  accelerate(deltaTime) {
    const accelerationVector = Vector2D.fromRadial(this.sprite.rotation, 1).mul(GameConfig.ALIEN_FIGHTER.FORWARD_ACCELERATION);
    const velocityChange = accelerationVector.mul(deltaTime);
    this.velocity = this.velocity.add(velocityChange);
    this.clampSpeed();
  }

  clampSpeed() {
    const speed = this.velocity.mag();
    if (speed > GameConfig.ALIEN_FIGHTER.MAX_SPEED) {
      this.velocity = this.velocity.norm().mul(GameConfig.ALIEN_FIGHTER.MAX_SPEED);
    }
  }

  tryShoot(gameTime) {
    if (gameTime - this.lastShotTime > GameConfig.ALIEN_FIGHTER.SHOT_COOLDOWN) {
      this.lastShotTime = gameTime;

      // Fire shot directly forward
      const shotVelocity = Vector2D.fromRadial(this.sprite.rotation, Plasma.speed);
      const newShot = new Plasma(
        new Vector2D(
          this.sprite.position.x,
          this.sprite.position.y
        ),
        shotVelocity
      );

      return {
        sound: GameConfig.ALIEN_FIGHTER.SHOOT_SOUND,
        volume: GameConfig.ALIEN_FIGHTER.SHOOT_VOLUME,
        shots: [newShot]
      };
    }
    return null;
  }

  update(deltaTime, playerPosition) {
    // Check if we need a new target
    if (this.hasReachedTarget()) {
      this.pickNewTarget(playerPosition);
    }


    // AI: Turn towards target and accelerate
    if (this.targetPosition) {
      const toTarget = this.targetPosition.sub(this.sprite.position);
      const targetAngle = Math.atan2(toTarget.y, toTarget.x) + GameConfig.SHARED.SPRITE_UP_ANGLE_OFFSET;

      this.turnTowards(targetAngle, deltaTime);
      this.accelerate(deltaTime);
    }

    // Update position
    super.update(deltaTime);
  }
}

export { AlienFighter };
