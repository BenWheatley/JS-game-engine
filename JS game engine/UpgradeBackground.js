/**
 * UpgradeBackground - Animated wormhole portal effect for upgrade menu
 *
 * Creates a pulsing wormhole portal with concentric circles radiating outward
 * Uses purple/blue/cyan gradient with glow effects
 */
class UpgradeBackground {
	constructor() {
		this.animationTime = 0;
		this.pulseSpeed = 0.001; // Speed of pulse animation
		this.numRings = 8; // Number of concentric rings
	}

	update(deltaTime) {
		// Continue animating based on game time
		this.animationTime += deltaTime;
	}

	draw(context, canvasWidth, canvasHeight, playerPosition) {
		// Save context state
		context.save();

		// Draw in screen space (not world space)
		context.resetTransform();

		// Get center of screen
		const centerX = canvasWidth / 2;
		const centerY = canvasHeight / 2;

		// Create radial gradient for overall portal glow
		const maxRadius = Math.max(canvasWidth, canvasHeight);
		const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
		gradient.addColorStop(0, 'rgba(100, 50, 200, 0.3)');
		gradient.addColorStop(0.3, 'rgba(50, 100, 200, 0.2)');
		gradient.addColorStop(0.6, 'rgba(20, 80, 150, 0.1)');
		gradient.addColorStop(1, 'rgba(10, 20, 40, 0.05)');

		// Fill background with gradient
		context.fillStyle = gradient;
		context.fillRect(0, 0, canvasWidth, canvasHeight);

		// Draw pulsing concentric rings
		context.globalCompositeOperation = 'lighter'; // Additive blending for glow

		for (let i = 0; i < this.numRings; i++) {
			// Calculate ring phase (offset each ring's animation)
			const ringPhase = (this.animationTime * this.pulseSpeed) + (i * 0.3);
			const pulseOffset = Math.sin(ringPhase) * 0.3 + 1.0; // Oscillate between 0.7 and 1.3

			// Ring radius grows outward, then resets
			const baseRadius = ((ringPhase % 1.0) * maxRadius * 1.2);
			const radius = baseRadius * pulseOffset;

			// Fade out as ring expands
			const fadeProgress = (ringPhase % 1.0);
			const alpha = Math.max(0, 1 - fadeProgress);

			// Alternate colors between rings
			const hue = (i % 3 === 0) ? 280 : (i % 3 === 1) ? 240 : 200; // Purple, blue, cyan
			const ringColor = `hsla(${hue}, 80%, 60%, ${alpha * 0.4})`;

			// Draw ring
			context.strokeStyle = ringColor;
			context.lineWidth = 3 + (1 - fadeProgress) * 5; // Thicker when fresh, thinner when fading
			context.shadowBlur = 20;
			context.shadowColor = ringColor;

			context.beginPath();
			context.arc(centerX, centerY, radius, 0, Math.PI * 2);
			context.stroke();

			// Draw inner glow
			if (fadeProgress < 0.5) {
				const innerRadius = Math.max(0, radius - context.lineWidth);
				if (innerRadius > 0) {
					context.globalAlpha = (1 - fadeProgress * 2) * 0.3;
					context.fillStyle = ringColor;
					context.beginPath();
					context.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
					context.fill();
					context.globalAlpha = 1;
				}
			}
		}

		// Draw swirling particles around center
		const particleCount = 30;
		for (let i = 0; i < particleCount; i++) {
			const particlePhase = (this.animationTime * this.pulseSpeed * 0.5) + (i / particleCount);
			const angle = (particlePhase * Math.PI * 2) + (i * Math.PI * 2 / particleCount);
			const spiralRadius = 100 + Math.sin(particlePhase * 3) * 50;

			const px = centerX + Math.cos(angle) * spiralRadius;
			const py = centerY + Math.sin(angle) * spiralRadius;

			const particleAlpha = Math.abs(Math.sin(particlePhase * 2)) * 0.6;
			context.fillStyle = `rgba(150, 100, 255, ${particleAlpha})`;
			context.shadowBlur = 10;
			context.shadowColor = 'rgba(150, 100, 255, 0.8)';

			context.beginPath();
			context.arc(px, py, 2 + Math.sin(particlePhase * 5) * 1, 0, Math.PI * 2);
			context.fill();
		}

		// Reset composite operation and shadow
		context.globalCompositeOperation = 'source-over';
		context.shadowBlur = 0;

		// Restore context state
		context.restore();
	}
}
