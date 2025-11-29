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

	/**
	 * Update attack state and beam weapon
	 * Called from update() method
	 * @param {number} gameTime - Current game time
	 * @param {Vector2D} playerPosition - Player position for targeting
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

					// Calculate target aim at player (but don't instantly snap to it)
					const toPlayer = playerPosition.sub(this.sprite.position);
					this.targetAimRotation = Math.atan2(toPlayer.y, toPlayer.x) + GameConfig.SHARED.SPRITE_UP_ANGLE_OFFSET;

					soundEvent = {
					   sound: GameConfig.ALIEN_BATTLESHIP.CHARGE_SOUND,
					   volume: GameConfig.ALIEN_BATTLESHIP.CHARGE_VOLUME
					};
				}
				break;

			case 'charging':
				// Gradually turn towards target aim (uses normal turn speed)
				// Note: We need deltaTime but it's not in this method - will be handled in update()

				// Wait for charge to complete
				if (stateElapsed >= GameConfig.ALIEN_BATTLESHIP.CHARGE_DURATION) {
					// Start firing
					this.attackState = 'firing';
					this.stateStartTime = gameTime;

					// Activate beam
					this.beam.activate();

					soundEvent = {
					   sound: GameConfig.ALIEN_BATTLESHIP.BEAM_SOUND,
					   volume: GameConfig.ALIEN_BATTLESHIP.BEAM_VOLUME
					};
				}
				break;

			case 'firing':
				// Keep beam aligned with ship rotation
				this.beam.origin = this.sprite.position;
				// Remove sprite offset since beam uses standard canvas rotation (0 = right)
				this.beam.rotation = this.sprite.rotation - GameConfig.SHARED.SPRITE_UP_ANGLE_OFFSET;

				// Wait for beam duration to complete
				if (stateElapsed >= GameConfig.ALIEN_BATTLESHIP.BEAM_DURATION) {
					// Return to cooldown
					this.attackState = 'cooldown';
					this.stateStartTime = gameTime;

					// Deactivate beam
					this.beam.deactivate();
					this.targetAimRotation = undefined;
				}
				break;
		}

		return soundEvent;
	}

	/**
	 * Check if beam hits player and return damage event
	 * @param {Vector2D} playerPosition - Player position
	 * @param {number} deltaTime - Time delta in milliseconds for damage calculation
	 * @returns {Object|null} Damage event {damage} if player was hit
	 */
	checkBeamHit(playerPosition, deltaTime) {
		if (this.attackState === 'firing') {
			if (this.beam.intersectsPoint(playerPosition)) {
				// Calculate damage based on time in beam (damage per second * fraction of second)
				const damage = this.beam.damagePerSecond * (deltaTime / 1000);
				return {
					damage: damage
				};
			}
		}
		return null;
	}

	update(deltaTime, playerPosition, gameTime) {
		// Update attack state machine (must be called before movement AI)
		let soundEvent = null;
		if (gameTime !== undefined) {
			soundEvent = this.updateAttackState(gameTime, playerPosition);
		}

		// Check if we need a new target (only when not charging/firing)
		if (this.attackState === 'cooldown' && this.hasReachedTarget()) {
			this.pickNewTarget(playerPosition);
		}

		// AI: Turn towards target and accelerate (only when in cooldown)
		if (this.attackState === 'cooldown' && this.targetPosition) {
			const toTarget = this.targetPosition.sub(this.sprite.position);
			const targetAngle = Math.atan2(toTarget.y, toTarget.x) + GameConfig.SHARED.SPRITE_UP_ANGLE_OFFSET;

			this.turnTowards(targetAngle, deltaTime);
			this.accelerate(deltaTime);  // Uses NPC base class method
		} else if (this.attackState === 'charging') {
			// While charging, turn towards aim position (no deceleration - this is space!)
			if (this.targetAimRotation !== undefined) {
				this.turnTowards(this.targetAimRotation, deltaTime);
			}
		}
		// Note: No else needed for 'firing' - ship maintains velocity in space

		// Update position using parent update
		super.update(deltaTime);
		
		return soundEvent;
	}

	/**
	 * Draw beam/telegraph (called before NPCs for proper Z-ordering)
	 * @param {CanvasRenderingContext2D} context - Canvas context
	 */
	drawBeam(context) {
		// Draw charge telegraph if charging
		if (this.attackState === 'charging') {
			const chargeProgress = (Date.now() - this.stateStartTime) / GameConfig.ALIEN_BATTLESHIP.CHARGE_DURATION;
			this.beam.origin = this.sprite.position;
			// Remove sprite offset since beam uses standard canvas rotation (0 = right)
			this.beam.rotation = this.sprite.rotation - GameConfig.SHARED.SPRITE_UP_ANGLE_OFFSET;
			this.beam.drawChargeTelegraph(context, chargeProgress);
		}

		// Draw beam if firing
		if (this.attackState === 'firing') {
			this.beam.origin = this.sprite.position;
			this.beam.rotation = this.sprite.rotation - GameConfig.SHARED.SPRITE_UP_ANGLE_OFFSET;
			this.beam.draw(context);
		}
	}
}

export { AlienBattleship };
