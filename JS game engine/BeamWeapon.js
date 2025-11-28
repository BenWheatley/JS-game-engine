import { GameConfig } from './GameConfig.js';

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
		this.damage = GameConfig.ALIEN_BATTLESHIP.BEAM_DAMAGE;
		this.active = false;           // Whether beam is currently firing
		this.hasHitPlayer = false;     // Track if player was hit this activation
	}

	/**
	 * Activate the beam
	 */
	activate() {
		this.active = true;
		this.hasHitPlayer = false;
	}

	/**
	 * Deactivate the beam
	 */
	deactivate() {
		this.active = false;
		this.hasHitPlayer = false;
	}

	/**
	 * Check if beam intersects with a point (for player collision)
	 * @param {Vector2D} point - Point to check
	 * @returns {boolean} True if point is inside beam
	 */
	intersectsPoint(point) {
		if (!this.active) return false;

		// Calculate beam end point
		const endX = this.origin.x + Math.cos(this.rotation) * this.length;
		const endY = this.origin.y + Math.sin(this.rotation) * this.length;

		// Vector from beam origin to point
		const dx = point.x - this.origin.x;
		const dy = point.y - this.origin.y;

		// Beam direction vector
		const beamDx = endX - this.origin.x;
		const beamDy = endY - this.origin.y;

		// Project point onto beam line
		const beamLengthSquared = beamDx * beamDx + beamDy * beamDy;
		const projection = (dx * beamDx + dy * beamDy) / beamLengthSquared;

		// Check if projection is within beam length (0 to 1)
		if (projection < 0 || projection > 1) {
			return false;
		}

		// Find closest point on beam line
		const closestX = this.origin.x + projection * beamDx;
		const closestY = this.origin.y + projection * beamDy;

		// Check if distance from point to line is within beam width
		const distanceSquared = (point.x - closestX) ** 2 + (point.y - closestY) ** 2;
		const halfWidth = this.width / 2;

		return distanceSquared <= halfWidth * halfWidth;
	}

	/**
	 * Draw the beam
	 * @param {CanvasRenderingContext2D} context - Canvas context
	 * @param {Vector2D} camera - Camera position for world-to-screen conversion
	 */
	draw(context, camera) {
		if (!this.active) return;

		context.save();

		// Translate to beam origin (world to screen)
		const screenX = this.origin.x - camera.x;
		const screenY = this.origin.y - camera.y;

		context.translate(screenX, screenY);
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
	 * @param {Vector2D} camera - Camera position for world-to-screen conversion
	 * @param {number} chargeProgress - Progress from 0 to 1 (0 = just started, 1 = fully charged)
	 */
	drawChargeTelegraph(context, camera, chargeProgress) {
		context.save();

		// Translate to beam origin (world to screen)
		const screenX = this.origin.x - camera.x;
		const screenY = this.origin.y - camera.y;

		context.translate(screenX, screenY);
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
