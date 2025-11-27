import { NPC } from './NPC.js';
import { GameConfig } from './GameConfig.js';
import { BeamWeapon } from './BeamWeapon.js';
import { NPCAIUtils } from './NPCAIUtils.js';
import { Vector2D } from './VibeEngine/VibeEngine.js';

/**
 * AlienBattleship (Siege Destroyer) - Heavy ship with charge-up beam weapon
 *
 * Attack Pattern:
 * 1. Cooldown: Move normally, seeking targets
 * 2. Charging: Stop moving, charge beam for CHARGE_DURATION (telegraph with red line)
 * 3. Firing: Beam active for BEAM_DURATION (deals damage to player if intersecting)
 * 4. Return to cooldown
 */
class AlienBattleship extends NPC {
	constructor(position, playerPosition, canvasWidth, canvasHeight) {
		super(position, playerPosition, canvasWidth, canvasHeight, GameConfig.ALIEN_BATTLESHIP);

		// Attack state machine
		this.attackState = 'cooldown';  // States: 'cooldown', 'charging', 'firing'
		this.stateStartTime = 0;

		// Beam weapon
		this.beam = new BeamWeapon(
			this.sprite.position,
			this.sprite.rotation,
			GameConfig.ALIEN_BATTLESHIP.BEAM_WIDTH,
			GameConfig.ALIEN_BATTLESHIP.BEAM_LENGTH
		);
	}

	accelerate(deltaTime) {
		const accelerationVector = Vector2D.fromRadial(this.sprite.rotation, 1).mul(GameConfig.ALIEN_BATTLESHIP.FORWARD_ACCELERATION);
		const velocityChange = accelerationVector.mul(deltaTime);
		this.velocity = this.velocity.add(velocityChange);
		this.clampSpeed();
	}

	clampSpeed() {
		const speed = this.velocity.mag();
		if (speed > GameConfig.ALIEN_BATTLESHIP.MAX_SPEED) {
			this.velocity = this.velocity.norm().mul(GameConfig.ALIEN_BATTLESHIP.MAX_SPEED);
		}
	}

	/**
	 * Update attack state and beam weapon
	 * @param {number} gameTime - Current game time
	 * @param {Vector2D} playerPosition - Player position for targeting
	 * @returns {Object|null} Sound event {sound, volume} if state changed
	 */
	updateAttackState(gameTime, playerPosition) {
		const stateElapsed = gameTime - this.stateStartTime;
		let soundEvent = null;

		switch (this.attackState) {
			case 'cooldown':
				// Wait for cooldown to complete
				if (stateElapsed >= GameConfig.ALIEN_BATTLESHIP.BEAM_COOLDOWN) {
					// Start charging
					this.attackState = 'charging';
					this.stateStartTime = gameTime;

					// Lock aim at player
					const toPlayer = playerPosition.sub(this.sprite.position);
					this.lockedRotation = Math.atan2(toPlayer.y, toPlayer.x) + GameConfig.SHARED.SPRITE_UP_ANGLE_OFFSET;

					// TODO: Play charge sound when asset is available
					// soundEvent = {
					//   sound: GameConfig.ALIEN_BATTLESHIP.CHARGE_SOUND,
					//   volume: GameConfig.ALIEN_BATTLESHIP.CHARGE_VOLUME
					// };
				}
				break;

			case 'charging':
				// Rotate sprite to locked aim
				if (this.lockedRotation !== undefined) {
					this.sprite.rotation = this.lockedRotation;
				}

				// Wait for charge to complete
				if (stateElapsed >= GameConfig.ALIEN_BATTLESHIP.CHARGE_DURATION) {
					// Start firing
					this.attackState = 'firing';
					this.stateStartTime = gameTime;

					// Activate beam
					this.beam.activate();

					// TODO: Play beam sound when asset is available
					// soundEvent = {
					//   sound: GameConfig.ALIEN_BATTLESHIP.BEAM_SOUND,
					//   volume: GameConfig.ALIEN_BATTLESHIP.BEAM_VOLUME
					// };
				}
				break;

			case 'firing':
				// Keep beam aligned with ship rotation
				this.beam.origin = this.sprite.position;
				this.beam.rotation = this.sprite.rotation;

				// Wait for beam duration to complete
				if (stateElapsed >= GameConfig.ALIEN_BATTLESHIP.BEAM_DURATION) {
					// Return to cooldown
					this.attackState = 'cooldown';
					this.stateStartTime = gameTime;

					// Deactivate beam
					this.beam.deactivate();
					this.lockedRotation = undefined;
				}
				break;
		}

		return soundEvent;
	}

	/**
	 * Check if beam hits player and return damage event
	 * @param {Vector2D} playerPosition - Player position
	 * @returns {Object|null} Damage event {damage} if player was hit
	 */
	checkBeamHit(playerPosition) {
		if (this.attackState === 'firing' && !this.beam.hasHitPlayer) {
			if (this.beam.intersectsPoint(playerPosition)) {
				this.beam.hasHitPlayer = true; // Only hit once per beam activation
				return {
					damage: GameConfig.ALIEN_BATTLESHIP.BEAM_DAMAGE
				};
			}
		}
		return null;
	}

	update(deltaTime, playerPosition) {
		// Check if we need a new target (only when not charging/firing)
		if (this.attackState === 'cooldown' && this.hasReachedTarget()) {
			this.pickNewTarget(playerPosition);
		}

		// AI: Turn towards target and accelerate (only when not charging/firing)
		if (this.attackState === 'cooldown' && this.targetPosition) {
			const toTarget = this.targetPosition.sub(this.sprite.position);
			const targetAngle = Math.atan2(toTarget.y, toTarget.x) + GameConfig.SHARED.SPRITE_UP_ANGLE_OFFSET;

			this.turnTowards(targetAngle, deltaTime);
			this.accelerate(deltaTime);
		} else if (this.attackState === 'charging' || this.attackState === 'firing') {
			// Stop moving while charging/firing (apply friction)
			this.velocity = this.velocity.mul(0.95);
		}

		// Update position
		super.update(deltaTime);
	}

	/**
	 * Draw the battleship and its beam/telegraph
	 * @param {CanvasRenderingContext2D} context - Canvas context
	 * @param {Vector2D} camera - Camera position
	 */
	draw(context, camera) {
		// Draw charge telegraph if charging
		if (this.attackState === 'charging') {
			const chargeProgress = (Date.now() - this.stateStartTime) / GameConfig.ALIEN_BATTLESHIP.CHARGE_DURATION;
			this.beam.origin = this.sprite.position;
			this.beam.rotation = this.sprite.rotation;
			this.beam.drawChargeTelegraph(context, camera, chargeProgress);
		}

		// Draw sprite
		super.draw(context, camera);

		// Draw beam if firing
		if (this.attackState === 'firing') {
			this.beam.draw(context, camera);
		}
	}
}

export { AlienBattleship };
