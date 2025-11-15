class Wormhole {
	constructor(playerPosition) {
		// Size is 27x28 multiplied by 3
		this.size = new Vector2D(27 * 3, 28 * 3);

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
	}

	update(deltaTime) {
		// Rotate at 0.5 Hz (0.5 rotations per second = π radians per second)
		this.rotation += Math.PI * deltaTime / 1000;
		this.sprite.rotation = this.rotation;
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
		// Draw the continuously spinning sprite
		this.sprite.draw();
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
