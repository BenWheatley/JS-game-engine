import { GameConfig } from './GameConfig.js';
import { CollisionDetection } from './VibeEngine/CollisionDetection.js';

/**
 * BeamWeapon - Visual beam attack used by AlienBattleship
 * Renders a gradient beam from origin point in a direction
 */
class BeamWeapon {
	constructor(origin, rotation, width, length) {
		this.origin = origin;          // Start position (Vector2D)
		this.rotation = rotation;      // Direction in radians
		this.width = width;            // Beam width in pixels
		this.length = length;          // Beam length in pixels
		this.damagePerSecond = GameConfig.ALIEN_BATTLESHIP.BEAM_DAMAGE_PER_SECOND;
		this.active = false;           // Whether beam is currently firing
	}

	/**
	 * Activate the beam
	 */
	activate() {
		this.active = true;
	}

	/**
	 * Deactivate the beam
	 */
	deactivate() {
		this.active = false;
	}

	/**
	 * Check if beam intersects with a point (for player collision)
	 * @param {Vector2D} point - Point to check
	 * @returns {boolean} True if point is inside beam
	 */
	intersectsPoint(point) {
		if (!this.active) return false;

		return CollisionDetection.checkBeamPoint(
			point,
			this.origin,
			this.rotation,
			this.length,
			this.width
		);
	}

	/**
	 * Check if beam intersects with a circle (for player collision with radius)
	 * @param {Vector2D} circleCenter - Center position of the circle
	 * @param {number} circleRadius - Radius of the circle
	 * @returns {boolean} True if circle intersects beam
	 */
	intersectsCircle(circleCenter, circleRadius) {
		if (!this.active) return false;

		return CollisionDetection.checkBeamCircle(
			circleCenter,
			circleRadius,
			this.origin,
			this.rotation,
			this.length,
			this.width
		);
	}

	/**
	 * Draw the beam
	 * @param {CanvasRenderingContext2D} context - Canvas context
	 */
	draw(context) {
		if (!this.active) return;

		context.save();

		// Translate to beam origin (canvas is already in world space)
		context.translate(this.origin.x, this.origin.y);
		context.rotate(this.rotation);

		// Draw gradient beam (Option 1: Thick Gradient Beam)
		const gradient = context.createLinearGradient(0, -this.width / 2, 0, this.width / 2);

		// Edge to center gradient (creates glowing effect)
		gradient.addColorStop(0, 'rgba(100, 150, 255, 0.1)');    // Edge: transparent blue
		gradient.addColorStop(0.3, 'rgba(150, 200, 255, 0.5)');  // Near-edge: semi-transparent cyan
		gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');  // Center: bright white core
		gradient.addColorStop(0.7, 'rgba(150, 200, 255, 0.5)');  // Near-edge: semi-transparent cyan
		gradient.addColorStop(1, 'rgba(100, 150, 255, 0.1)');    // Edge: transparent blue

		// Draw main beam rectangle
		context.fillStyle = gradient;
		context.fillRect(0, -this.width / 2, this.length, this.width);

		// Add bright center line for extra intensity
		context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
		context.lineWidth = 4;
		context.beginPath();
		context.moveTo(0, 0);
		context.lineTo(this.length, 0);
		context.stroke();

		// Add glow effect at beam origin (charge point)
		const glowGradient = context.createRadialGradient(0, 0, 0, 0, 0, this.width);
		glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
		glowGradient.addColorStop(0.5, 'rgba(150, 200, 255, 0.4)');
		glowGradient.addColorStop(1, 'rgba(100, 150, 255, 0)');

		context.fillStyle = glowGradient;
		context.beginPath();
		context.arc(0, 0, this.width, 0, Math.PI * 2);
		context.fill();

		context.restore();
	}

	/**
	 * Draw charge-up telegraph (warning indicator before beam fires)
	 * @param {CanvasRenderingContext2D} context - Canvas context
	 * @param {number} chargeProgress - Progress from 0 to 1 (0 = just started, 1 = fully charged)
	 */
	drawChargeTelegraph(context, chargeProgress) {
		context.save();

		// Translate to beam origin (canvas is already in world space)
		context.translate(this.origin.x, this.origin.y);
		context.rotate(this.rotation);

		// Draw thin flashing red laser pointer line
		// Flash by pulsing between two alpha values
		const flashSpeed = 8; // How fast it flashes
		const flash = Math.sin(Date.now() / 100 * flashSpeed) * 0.5 + 0.5; // 0 to 1
		const alpha = 0.4 + (flash * 0.6); // Pulsing alpha

		context.strokeStyle = `rgba(255, 50, 50, ${alpha})`;
		context.lineWidth = 2;
		context.setLineDash([8, 4]); // Dashed line
		context.beginPath();
		context.moveTo(0, 0);
		context.lineTo(this.length, 0);
		context.stroke();
		context.setLineDash([]); // Reset dash

		context.restore();
	}
}

export { BeamWeapon };
