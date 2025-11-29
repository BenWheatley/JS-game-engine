import { Particle } from './Particle.js';
import { Vector2D } from './Vector2D.js';

class ParticleSystem {
	constructor() {
		this.particles = [];
	}

	// Create a small burst for weapon impacts
	spawnImpact(position, color = "255, 200, 100") {
		const particleCount = 8;
		const speed = 0.05; // pixels per millisecond
		const lifetime = 300; // milliseconds
		const size = 2; // pixels

		for (let i = 0; i < particleCount; i++) {
			const angle = (Math.PI * 2 * i) / particleCount;
			const velocity = new Vector2D(
				Math.cos(angle) * speed,
				Math.sin(angle) * speed
			);

			this.particles.push(new Particle(
				new Vector2D(position.x, position.y),
				velocity,
				lifetime,
				color,
				size
			));
		}
	}

	// Create a large burst for NPC explosions
	spawnExplosion(position, color = "255, 150, 50", params = {}) {
		const particleCount = params.particleCount || 24;
		const minSpeed = params.minSpeed || 0.03;
		const maxSpeed = params.maxSpeed || 0.12;
		const lifetime = params.lifetime || 600; // milliseconds
		const minSize = params.minSize || 2;
		const maxSize = params.maxSize || 4;

		for (let i = 0; i < particleCount; i++) {
			const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.3;
			const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
			const velocity = new Vector2D(
				Math.cos(angle) * speed,
				Math.sin(angle) * speed
			);

			const size = minSize + Math.random() * (maxSize - minSize);

			this.particles.push(new Particle(
				new Vector2D(position.x, position.y),
				velocity,
				lifetime,
				color,
				size
			));
		}
	}

	update(deltaTime) {
		// Update all particles
		for (const particle of this.particles) {
			particle.update(deltaTime);
		}

		// Remove dead particles
		this.particles = this.particles.filter(p => !p.isDead());
	}

	draw(ctx) {
		for (const particle of this.particles) {
			particle.draw(ctx);
		}
	}

	clear() {
		this.particles = [];
	}
}

export { ParticleSystem };
