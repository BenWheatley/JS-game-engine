import { NPC } from './NPC.js';
import { GameConfig } from './GameConfig.js';
import { AlienFighter } from './AlienFighter.js';
import { NPCAIUtils } from './NPCAIUtils.js';
import { Vector2D } from './VibeEngine/VibeEngine.js';

/**
 * AlienCarrier - Massive ship that spawns fighters when on-screen
 *
 * Behavior:
 * - Slow-moving, heavily armored
 * - Spawns AlienFighters periodically when visible to player
 * - No direct weapons, relies on spawned fighters
 * - High priority target (dangerous if left alive)
 */
class AlienCarrier extends NPC {
	constructor(position, playerPosition, canvasWidth, canvasHeight) {
		super(position, playerPosition, canvasWidth, canvasHeight, GameConfig.ALIEN_CARRIER);

		// Spawn tracking
		this.lastSpawnTime = 0;
		this.spawnedFighters = [];  // References to spawned fighters (for tracking count)
		this.canvasWidth = canvasWidth;
		this.canvasHeight = canvasHeight;
	}

	accelerate(deltaTime) {
		const accelerationVector = Vector2D.fromRadial(this.sprite.rotation, 1).mul(GameConfig.ALIEN_CARRIER.FORWARD_ACCELERATION);
		const velocityChange = accelerationVector.mul(deltaTime);
		this.velocity = this.velocity.add(velocityChange);
		this.clampSpeed();
	}

	clampSpeed() {
		const speed = this.velocity.mag();
		if (speed > GameConfig.ALIEN_CARRIER.MAX_SPEED) {
			this.velocity = this.velocity.norm().mul(GameConfig.ALIEN_CARRIER.MAX_SPEED);
		}
	}

	/**
	 * Check if carrier is visible on screen (within camera viewport)
	 * @param {Vector2D} camera - Camera position (top-left of viewport)
	 * @param {number} canvasWidth - Viewport width
	 * @param {number} canvasHeight - Viewport height
	 * @returns {boolean} True if carrier is on-screen
	 */
	isVisibleOnScreen(camera, canvasWidth, canvasHeight) {
		const margin = GameConfig.ALIEN_CARRIER.VISIBILITY_MARGIN;
		const pos = this.sprite.position;

		return (
			pos.x > camera.x + margin &&
			pos.x < camera.x + canvasWidth - margin &&
			pos.y > camera.y + margin &&
			pos.y < camera.y + canvasHeight - margin
		);
	}

	/**
	 * Attempt to spawn fighters
	 * @param {number} gameTime - Current game time
	 * @param {Vector2D} camera - Camera position
	 * @param {number} canvasWidth - Viewport width
	 * @param {number} canvasHeight - Viewport height
	 * @param {Vector2D} playerPosition - Player position for fighter AI
	 * @returns {Object|null} Spawn result {fighters: AlienFighter[], sound, volume} or null
	 */
	trySpawnFighters(gameTime, camera, canvasWidth, canvasHeight, playerPosition) {
		// Check cooldown
		if (gameTime - this.lastSpawnTime < GameConfig.ALIEN_CARRIER.SPAWN_COOLDOWN) {
			return null;
		}

		// Check if on-screen
		if (!this.isVisibleOnScreen(camera, canvasWidth, canvasHeight)) {
			return null;
		}

		// Clean up dead fighters from spawn tracking
		this.spawnedFighters = this.spawnedFighters.filter(fighter => fighter.health > 0);

		// Check if we're at spawn limit
		if (this.spawnedFighters.length >= GameConfig.ALIEN_CARRIER.MAX_SPAWNED_FIGHTERS) {
			return null;
		}

		// Spawn fighters
		this.lastSpawnTime = gameTime;
		const newFighters = [];

		for (let i = 0; i < GameConfig.ALIEN_CARRIER.SPAWN_COUNT; i++) {
			// Spawn fighters near carrier with slight offset
			const offsetAngle = (Math.PI * 2 * i) / GameConfig.ALIEN_CARRIER.SPAWN_COUNT;
			const spawnOffset = Vector2D.fromRadial(offsetAngle, 80); // 80 pixels from carrier center
			const spawnPosition = this.sprite.position.add(spawnOffset);

			const fighter = new AlienFighter(
				spawnPosition,
				playerPosition,
				this.canvasWidth,
				this.canvasHeight
			);

			newFighters.push(fighter);
			this.spawnedFighters.push(fighter);
		}

		// Return spawn result with sound event
		return {
			fighters: newFighters,
			// TODO: Play spawn sound when asset is available
			// sound: GameConfig.ALIEN_CARRIER.SPAWN_SOUND,
			// volume: GameConfig.ALIEN_CARRIER.SPAWN_VOLUME
		};
	}

	update(deltaTime, playerPosition) {
		// Check if we need a new target
		if (this.hasReachedTarget()) {
			this.pickNewTarget(playerPosition);
		}

		// AI: Turn towards target and accelerate (carrier moves slowly)
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

export { AlienCarrier };
