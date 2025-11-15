class Wormhole {
	constructor(playerPosition) {
		this.size = new Vector2D(64, 64);

		// Spawn at random position outside visible area but within minimap range
		const angle = Math.random() * Math.PI * 2;
		const minDist = GameConfig.SPAWNING.SPAWN_MIN_DISTANCE;
		const maxDist = GameConfig.SPAWNING.SPAWN_MAX_DISTANCE;
		const distance = minDist + Math.random() * (maxDist - minDist);

		this.position = new Vector2D(
			playerPosition.x + Math.cos(angle) * distance,
			playerPosition.y + Math.sin(angle) * distance
		);

		// Create sprite for main game view
		this.sprite = new Sprite('wormhole.png', this.position, this.size);

		// Animation properties
		this.rotation = 0;
		this.pulsePhase = 0;
	}

	update(deltaTime) {
		// Rotate slowly
		this.rotation += 0.001 * deltaTime;
		this.sprite.rotation = this.rotation;

		// Pulse animation
		this.pulsePhase += 0.002 * deltaTime;
	}

	// Wrap at minimap boundaries (same as NPCs)
	wrap(playerPosition) {
		const wrapDistance = GameConfig.WORLD.NPC_WRAP_DISTANCE;
		const offsetX = this.position.x - playerPosition.x;
		const offsetY = this.position.y - playerPosition.y;

		if (offsetX > wrapDistance) {
			this.position.x = playerPosition.x - wrapDistance;
		} else if (offsetX < -wrapDistance) {
			this.position.x = playerPosition.x + wrapDistance;
		}

		if (offsetY > wrapDistance) {
			this.position.y = playerPosition.y - wrapDistance;
		} else if (offsetY < -wrapDistance) {
			this.position.y = playerPosition.y + wrapDistance;
		}

		// Update sprite position
		this.sprite.position = this.position;
	}

	draw() {
		// Draw the sprite with pulsing scale
		const pulseScale = 1 + Math.sin(this.pulsePhase) * 0.1;
		const originalSize = this.sprite.size;
		this.sprite.size = new Vector2D(
			originalSize.x * pulseScale,
			originalSize.y * pulseScale
		);
		this.sprite.draw();
		this.sprite.size = originalSize; // Restore original size
	}

	// Check collision with player
	checkCollision(player) {
		const dx = this.position.x - player.sprite.position.x;
		const dy = this.position.y - player.sprite.position.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		const collisionRadius = (this.size.x + player.sprite.size.x) / 3; // Combined radius
		return distance < collisionRadius;
	}
}
