import { Vector2D, Sprite } from './VibeEngine/VibeEngine.js';
import { GameConfig } from './GameConfig.js';

class Wormhole {
	constructor(position) {
		// Size is 27x28 multiplied by 3
		this.size = new Vector2D(27 * 3, 28 * 3);

		// Use provided spawn position
		this.position = position;

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
}

export { Wormhole };
