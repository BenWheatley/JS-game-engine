class Particle {
	constructor(position, velocity, lifetime, color, size) {
		this.position = position;
		this.velocity = velocity;
		this.lifetime = lifetime; // Total lifetime in milliseconds
		this.age = 0; // Current age in milliseconds
		this.color = color; // RGB color string like "255, 100, 50"
		this.size = size; // Radius in pixels
	}

	update(deltaTime) {
		// Update position
		this.position = this.position.add(this.velocity.mul(deltaTime));

		// Update age
		this.age += deltaTime;

		// Apply friction (slow down over time)
		this.velocity = this.velocity.mul(0.98);
	}

	isDead() {
		return this.age >= this.lifetime;
	}

	draw(ctx) {
		// Calculate alpha based on remaining lifetime
		const lifePercent = 1 - (this.age / this.lifetime);
		const alpha = lifePercent;

		// Draw circle in world space (context is already translated by camera)
		ctx.fillStyle = `rgba(${this.color}, ${alpha})`;
		ctx.beginPath();
		ctx.arc(
			this.position.x,
			this.position.y,
			this.size,
			0,
			Math.PI * 2
		);
		ctx.fill();
	}
}
