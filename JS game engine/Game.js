import { ParticleSystem, CollisionDetection, DebugLogger, Vector2D, Particle } from './VibeEngine/VibeEngine.js';
import { UpgradeBackground } from './UpgradeBackground.js';
import { Player } from './Player.js';
import { Minimap } from './Minimap.js';
import { SpawnSystem } from './SpawnSystem.js';
import { Wormhole } from './Wormhole.js';
import { GameConfig } from './GameConfig.js';
import { Plasma } from './Plasma.js';
import { Missile } from './Missile.js';
import { Laser } from './Laser.js';
import { AlienCarrier } from './AlienCarrier.js';
import { AlienBattleship } from './AlienBattleship.js';

class Game extends EventTarget {
	/**
	* Gameplay state enum values
	* Note: Menu visibility is tracked by MenuSystem
	*/
	static States = {
		PLAYING: 'playing',
		PAUSED: 'paused',
		UPGRADING: 'upgrading'  // Special state for upgrade menu - time passes but player doesn't control
	};

	constructor(canvas) {
		super();
		this.canvas = canvas;
		this.upgradeBackground = new UpgradeBackground();
		
		// Player and entities
		this.player = new Player();
		this.npcs = [];
		this.playerProjectiles = [];
		this.npcProjectiles = [];
		this.wormhole = null;

		// Systems
		this.particleSystem = new ParticleSystem();
		this.minimap = new Minimap(canvas.width, canvas.height);

		// Gameplay state (null when in menus, PLAYING during gameplay, PAUSED when paused)
		this.currentState = null;
		this.score = 0;
		this.currentLevel = 0;

		// Timing
		this.gameTime = 0; // Accumulated deltaTime (pauses when game paused)
		this.lastShotTime = {
			laser: 0,
			plasma: 0,
			missile: 0
		}; // Game time of last shot per projectile type

		// Achievement tracking
		this.achievementStats = {
		  damageTakenThisWave: 0 // Damage taken in current wave (for untouchable)
		};
		
		this.advanceLevel();
	}

	// Render loop
	render() {
		// I want the blocky look for this game; strictly this doesn't need to be set every frame, but it doesn't hurt to be every frame
		context.imageSmoothingEnabled = false;

		this.renderGamespaceElements();

		// Special rendering for upgrade menu
		if (this.currentState === Game.States.UPGRADING) {
			this.upgradeBackground.draw(context, canvas.width, canvas.height, 0, 128, 255, 255);
		} else {
			this.renderHUD();
			this.renderWormholeMessageAndArrow();
		}
	}
	
	renderHUD() {
		// HUD - render in screen space
		// Health bar
		const healthBarWidth = this.player.getMaxHealth() * 0.85;
		const healthBarHeight = GameConfig.HUD.HEALTH_BAR_HEIGHT;
		const healthBarX = GameConfig.HUD.HEALTH_BAR_X;
		const healthBarY = GameConfig.HUD.HEALTH_BAR_Y;

		// Draw health bar background (red - shows damage)
		context.fillStyle = GameConfig.HUD.HEALTH_BAR_BG_COLOR;
		context.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

		// Draw health bar foreground (green - shows current health)
		const healthPercentage = Math.max(0, Math.min(1, this.player.health / this.player.getMaxHealth()));
		const currentHealthWidth = healthBarWidth * healthPercentage;
		context.fillStyle = GameConfig.HUD.HEALTH_BAR_FG_COLOR;
		context.fillRect(healthBarX, healthBarY, currentHealthWidth, healthBarHeight);

		// Draw health bar border (white)
		context.strokeStyle = GameConfig.HUD.HEALTH_BAR_BORDER_COLOR;
		context.lineWidth = GameConfig.HUD.HEALTH_BAR_BORDER_WIDTH;
		context.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

		// Draw score
		context.strokeStyle = '#000000';
		context.lineWidth = 2;
		context.fillStyle = '#FFFFFF';
		context.font = '12px "Press Start 2P"';
		context.textAlign = 'left';
		context.strokeAndFillText(`Score: ${this.score}`, 10, 60);
		
		// Draw level (same style)
		context.strokeAndFillText(`Level: ${this.currentLevel}`, 10, 80);

		// Mini-map
		this.minimap.draw(context, {
			npcs: this.npcs,
			wormhole: this.wormhole
		}, this.player.sprite.position);
	}
	
	renderGamespaceElements() {
		// Background
		context.fillStyle = 'black';
		context.fillRect(0, 0, canvas.width, canvas.height);

		context.save();
		context.translate(
			canvas.width/2-this.player.sprite.position.x,
			canvas.height/2-this.player.sprite.position.y
		);

		// Draw tiled background
		const tileWidth = backgroundTileSize.x * 0.9;
		const tileHeight = backgroundTileSize.y * 0.85;

		// Calculate which tiles are visible
		const startX = Math.floor((this.player.sprite.position.x - canvas.width) / tileWidth) * tileWidth;
		const startY = Math.floor((this.player.sprite.position.y - canvas.height) / tileHeight) * tileHeight;
		const endX = Math.ceil((this.player.sprite.position.x + canvas.width) / tileWidth) * tileWidth;
		const endY = Math.ceil((this.player.sprite.position.y + canvas.height) / tileHeight) * tileHeight;

		// Draw tiles
		context.globalCompositeOperation = 'lighten';
		for (let x = startX; x <= endX; x += tileWidth) {
			for (let y = startY; y <= endY; y += tileHeight) {
				backgroundSprite.position.x = x + tileWidth / 2;
				backgroundSprite.position.y = y + tileHeight / 2;
				backgroundSprite.draw();
			}
		}
		// Reset composition
		context.globalCompositeOperation = 'source-over';

		// Z-order: Wormhole first (bottom layer)
		if (this.wormhole) {
			this.wormhole.draw();
		}

		// Shots
		for (const projectile of this.playerProjectiles) {
			projectile.draw();
		}
		for (const projectile of this.npcProjectiles) {
			projectile.draw();
		}

		// NPCs
		const camera = new Vector2D(
			this.player.sprite.position.x - canvas.width / 2,
			this.player.sprite.position.y - canvas.height / 2
		);
		for (const npc of this.npcs) {
			// Battleships need camera for beam rendering
			if (npc instanceof AlienBattleship) {
				npc.draw(context, camera);
			} else {
				npc.draw();
			}
		}

		// Particles
		this.particleSystem.draw(context);

		// Player last (top layer) - don't draw if dead
		if (this.player.health > 0) {
			this.player.draw();
		}

		context.restore();
	}
	
	renderWormholeMessageAndArrow() {
		if (!this.wormhole) {
			return;
		}
		
		const wormhole_text_top = 60;
		// Draw message with stroke
		context.font = '16px "Press Start 2P"';
		context.textAlign = 'center';
		// Draw white stroke (outline)
		context.strokeStyle = '#000000';
		context.lineWidth = 2;
		// Draw cyan fill
		context.fillStyle = '#00FFFF';
		context.strokeAndFillText('Wormhole detected!', canvas.width / 2, wormhole_text_top);

		// Calculate direction to wormhole
		const dx = this.wormhole.position.x - this.player.sprite.position.x;
		const dy = this.wormhole.position.y - this.player.sprite.position.y;
		const angle = Math.atan2(dy, dx);

		// Check if wormhole is on-screen
		const screenHalfWidth = canvas.width / 2;
		const screenHalfHeight = canvas.height / 2;
		const wormholeOnScreen = Math.abs(dx) < screenHalfWidth && Math.abs(dy) < screenHalfHeight;

		// Only draw arrow if wormhole is off-screen
		if (!wormholeOnScreen) {
			// Draw arrow at screen edge pointing to wormhole
			const arrowDistance = 50; // Distance from screen edge
			const centerX = canvas.width / 2;
			const centerY = canvas.height / 2;

			// Calculate arrow position at edge of screen
			let arrowX = centerX + Math.cos(angle) * (canvas.width / 2 - arrowDistance);
			let arrowY = centerY + Math.sin(angle) * (canvas.height / 2 - arrowDistance);

			// Clamp to screen bounds
			arrowX = Math.max(arrowDistance, Math.min(canvas.width - arrowDistance, arrowX));
			arrowY = Math.max(arrowDistance, Math.min(canvas.height - arrowDistance, arrowY));

			// Draw arrow
			context.save();
			context.translate(arrowX, arrowY);
			context.rotate(angle);
			context.strokeStyle = '#000000'; // Draw white stroke (outline)
			context.lineWidth = 2;
			context.fillStyle = '#00FFFF'; // Draw cyan fill
			context.beginPath();
			context.moveTo(15, 0);
			context.lineTo(-10, -10);
			context.lineTo(-10, 10);
			context.closePath();
			context.stroke();
			context.fill();
			context.restore();
		}
	}
	
	// Helper: Update all projectiles
	updateAllProjectiles() {
		for (const projectile of this.playerProjectiles) {
			projectile.update();
		}
		for (const projectile of this.npcProjectiles) {
			projectile.update();
		}
	}

	// Helper: Check if entity is beyond wrap distance from player (per-axis check)
	isBeyondWrapDistance(entityPos, playerPos, wrapDistance) {
		const offsetX = entityPos.x - playerPos.x;
		const offsetY = entityPos.y - playerPos.y;
		return Math.abs(offsetX) > wrapDistance || Math.abs(offsetY) > wrapDistance;
	}

	// Helper: Despawn projectiles that are too far from player (uses same logic as NPC wrapping)
	despawnDistantProjectiles(wrapDistance) {
		this.playerProjectiles = this.playerProjectiles.filter(projectile =>
			!this.isBeyondWrapDistance(projectile.sprite.position, this.player.sprite.position, wrapDistance)
		);
		this.npcProjectiles = this.npcProjectiles.filter(projectile =>
			!this.isBeyondWrapDistance(projectile.sprite.position, this.player.sprite.position, wrapDistance)
		);
	}
		
	// Helper: Wrap a single coordinate around world boundaries
	wrapCoordinate(npcCoord, playerCoord, wrapDistance) {
		const offset = npcCoord - playerCoord;
		if (offset > wrapDistance) {
			return playerCoord - wrapDistance;
		} else if (offset < -wrapDistance) {
			return playerCoord + wrapDistance;
		}
		return npcCoord;
	}
	
	// Player shooting function
	shoot() {
		const weaponStats = this.player.getWeaponStats();
		const spreadRadians = weaponStats.spreadAngle * (Math.PI / 180);
		const shotPosition = new Vector2D(
			this.player.sprite.position.x,
			this.player.sprite.position.y
		);

		// Determine which weapon types are ready to fire
		const weaponTypesReady = new Set();
		for (let i = 0; i < weaponStats.projectileTypes.length; i++) {
			const projectileType = weaponStats.projectileTypes[i];

			// Calculate cooldown multiplier: missiles fire at half rate (2x cooldown)
			let cooldownMultiplier = 1;
			if (projectileType === 'missile') {
				cooldownMultiplier = 3;
			}
			const effectiveCooldown = weaponStats.fireRate * cooldownMultiplier;

			// Check if this weapon type is ready to fire
			if (this.gameTime > this.lastShotTime[projectileType] + effectiveCooldown) {
				weaponTypesReady.add(projectileType);
			}
		}

		// Fire all weapon slots whose types are ready
		if (weaponTypesReady.size > 0) {
			for (let i = 0; i < weaponStats.projectileTypes.length; i++) {
				const projectileType = weaponStats.projectileTypes[i];

				// Only fire if this weapon type is ready
				if (weaponTypesReady.has(projectileType)) {
					// Calculate angle for this shot
					let shotAngle = this.player.sprite.rotation;
					if (weaponStats.projectileTypes.length > 1) {
						// Distribute shots evenly across the spread angle
						const angleOffset = (i - (weaponStats.projectileTypes.length - 1) / 2) * spreadRadians;
						shotAngle += angleOffset;
					}

					// Create the appropriate projectile
					let newShot;
					if (projectileType === 'plasma') {
						const shotVelocity = Vector2D.fromRadial(shotAngle, Plasma.speed);
						newShot = new Plasma(shotPosition, shotVelocity);
					} else if (projectileType === 'missile') {
						const shotVelocity = Vector2D.fromRadial(shotAngle, Missile.speed);
						newShot = new Missile(shotPosition, shotVelocity);
					} else if (projectileType === 'laser') {
						const shotVelocity = Vector2D.fromRadial(shotAngle, Laser.speed);
						newShot = new Laser(shotPosition, shotVelocity);
					} else {
						DebugLogger.log(`Unexpected projectileType: ${projectileType}`);
					}

					this.playerProjectiles.push(newShot);
				}
			}

			// Update last shot time for all weapon types that fired
			for (const weaponType of weaponTypesReady) {
				this.lastShotTime[weaponType] = this.gameTime;
			}

			// Play sound
			soundManager.play('shoot', 0.3);
		}
	}

	// Helper function for handling NPC destruction
	handleNPCDestroyed(npc) {
		// Add score
		this.score += npc.scoreValue;

		// Spawn explosion particles
		this.particleSystem.spawnExplosion(npc.sprite.position, npc.particleColor);

		// Handle spawns (e.g., asteroid fragments)
		// Note: hitResult.spawns is handled in the shot collision code path
		// For player collisions, we don't need spawns since the NPC is destroyed instantly

		// Track alien kills (not asteroids) for centurion achievement
		if (npc.constructor.name !== 'Asteroid' && npc.constructor.name !== 'AsteroidSpawn') {
			achievementManager.progress('centurion', 1);
		}
	}

	// Update loop; deltaTime is milliseconds
	update(deltaTime) {
		// Handle gamepad input for menu navigation
		const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
		for (let i = 0; i < gamepads.length; i++) {
			if (gamepads[i]) {
				menuSystem.handleGamepadInput(gamepads[i]);
				break; // Only handle first connected gamepad
			}
		}

		// Handle pause input regardless of game state
		this.handlePauseInput();

		// Update upgrade background animation if in upgrading state
		if (this.currentState === Game.States.UPGRADING) {
			this.upgradeBackground.update(deltaTime);
			return;
		}

		// Only update game logic during active gameplay
		if (this.currentState !== Game.States.PLAYING) {
			return;
		}
		// Accumulate game time (only advances during gameplay, not when paused)
		this.gameTime += deltaTime;

		// Only process player input if player is alive
		if (this.player.health > 0) {
			if (engine.keyDown["ArrowLeft"]) {
				this.player.turnLeft(deltaTime);
			}
			if (engine.keyDown["ArrowRight"]) {
				this.player.turnRight(deltaTime);
			}
			if (engine.keyDown["ArrowUp"]) {
				this.player.accelerate(deltaTime);
			}
			if (engine.keyDown["ArrowDown"]) {
				this.player.reverseThrust(deltaTime);
			}
			if (engine.keyDown[" "]) {
				this.shoot();
			}

			this.player.update(deltaTime);
			this.player.updateShieldRegen(deltaTime); // Update shield regeneration
		}

		// Update all NPCs with unified loop
		for (const npc of this.npcs) {
			// All NPCs accept playerPosition; battleships also need gameTime
			npc.update(deltaTime, this.player.sprite.position, this.gameTime);

			// Handle NPC shooting (unified)
			if (npc.tryShoot) {
				const shootResult = npc.tryShoot(this.gameTime);
				if (shootResult && shootResult.shots) {
					this.npcProjectiles.push(...shootResult.shots);
					if (shootResult.sound) {
						soundManager.play(shootResult.sound, shootResult.volume);
					}
				}
			}

			// Handle carrier spawning
			if (npc instanceof AlienCarrier) {
				const camera = new Vector2D(
					this.player.sprite.position.x - this.canvas.width / 2,
					this.player.sprite.position.y - this.canvas.height / 2
				);
				const spawnResult = npc.trySpawnFighters(
					this.gameTime,
					camera,
					this.canvas.width,
					this.canvas.height,
					this.player.sprite.position
				);
				if (spawnResult && spawnResult.fighters) {
					this.npcs.push(...spawnResult.fighters);
					// TODO: Play spawn sound when asset is available
					// if (spawnResult.sound) {
					//   soundManager.play(spawnResult.sound, spawnResult.volume);
					// }
				}
			}

			// Handle battleship beam damage (only if player is alive)
			if (this.player.health > 0 && npc instanceof AlienBattleship) {
				const beamHit = npc.checkBeamHit(this.player.sprite.position);
				if (beamHit) {
					this.player.health -= beamHit.damage;
					this.player.onDamage(); // Reset shield regen timer
					DebugLogger.log(`Player hit by battleship beam! Damage: ${beamHit.damage}, Health: ${this.player.health}`);
					// TODO: Play beam hit sound when asset is available
					// if (beamHit.sound) {
					//   soundManager.play(beamHit.sound, beamHit.volume);
					// }

					// Track damage taken for untouchable achievement
					this.achievementStats.damageTakenThisWave += beamHit.damage;
				}
			}
		}

		// Update all projectiles
		this.updateAllProjectiles();

		// Update particles
		this.particleSystem.update(deltaTime);

		// Update wormhole if it exists
		if (this.wormhole) {
			this.wormhole.update(deltaTime);
			this.wormhole.wrap(this.player.sprite.position);
		}

		// Wave-based spawning: Spawn wormhole when wave cleared
		this.trySpawnWormhole();

		// Collision detection
		const npcsToRemove = new Set();
		const playerProjectilesToRemove = new Set();
		const npcProjectilesToRemove = new Set();

		// Check player shot collisions with all NPCs (unified loop)
		for (const shot of this.playerProjectiles) {
			for (const npc of this.npcs) {
				if (CollisionDetection.checkAABB(shot, npc)) {
					playerProjectilesToRemove.add(shot);

					// Spawn impact particles and sound from shot properties
					if (shot.particleColor) {
						this.particleSystem.spawnImpact(shot.sprite.position, shot.particleColor);
					}
					if (shot.hitSound) {
						soundManager.play(shot.hitSound, shot.hitVolume);
					}

					// Check if NPC is offscreen for Sniper achievement
					const npcScreenX = npc.sprite.position.x - this.player.sprite.position.x + canvas.width / 2;
					const npcScreenY = npc.sprite.position.y - this.player.sprite.position.y + canvas.height / 2;
					const isOffscreen = npcScreenX < 0 || npcScreenX > canvas.width ||
										npcScreenY < 0 || npcScreenY > canvas.height;

					if (isOffscreen) {
						achievementManager.unlock('sniper');
					}

					DebugLogger.log(`Shot damage: ${shot.damage}, NPC type: ${npc.constructor.name}, NPC health before: ${npc.health}`);
					const hitResult = npc.onHit(shot.damage);
					DebugLogger.log(`Hit result destroyed: ${hitResult.destroyed}, NPC health after: ${npc.health}`);
					if (hitResult.destroyed) {
						npcsToRemove.add(npc);
						this.handleNPCDestroyed(npc);

						// Handle spawns (specific to asteroid splitting)
						if (hitResult.spawns) {
							this.npcs.push(...hitResult.spawns);
						}
					}
					if (hitResult.sound) {
						soundManager.play(hitResult.sound, hitResult.volume);
					}
				}
			}
		}

		// Check player-NPC collisions (unified loop) - only if player is alive
		if (this.player.health > 0) {
			for (const npc of this.npcs) {
				if (CollisionDetection.checkAABB(this.player, npc)) {
					npcsToRemove.add(npc);

					const collisionResult = npc.onCollideWithPlayer();
					DebugLogger.log(`Player-NPC collision! NPC type: ${npc.constructor.name}, NPC health: ${npc.health}, collision damage: ${collisionResult.damage}, player health before: ${this.player.health}`);

					// Handle NPC destruction (score, particles, centurion achievement)
					this.handleNPCDestroyed(npc);

					// Apply damage to player
					this.player.health -= collisionResult.damage;
					this.player.onDamage(); // Reset shield regen timer
					DebugLogger.log(`Player health after: ${this.player.health}`);

					if (collisionResult.sound) {
						soundManager.play(collisionResult.sound, collisionResult.volume);
					}

					// Track collision kills for demolition_derby achievement
					achievementManager.progress('demolition_derby', 1);

					// Track damage taken for untouchable achievement
					this.achievementStats.damageTakenThisWave += collisionResult.damage;
				}
			}
		}

		// Check NPC projectile-player collisions (unified loop) - only if player is alive
		if (this.player.health > 0) {
			for (const projectile of this.npcProjectiles) {
				if (CollisionDetection.checkAABB(this.player, projectile)) {
					npcProjectilesToRemove.add(projectile);

					const hitResult = projectile.onHitPlayer();
					this.player.health -= hitResult.damage;
					this.player.onDamage(); // Reset shield regen timer
					DebugLogger.log(`Player hit by projectile! Health: ${this.player.health}`);

					if (hitResult.sound) {
						soundManager.play(hitResult.sound, hitResult.volume);
					}

					if (hitResult.particleColor) {
						this.particleSystem.spawnExplosion(projectile.sprite.position, hitResult.particleColor);
					}

					// Track damage taken for untouchable achievement
					this.achievementStats.damageTakenThisWave += hitResult.damage;
				}
			}
		}

		// Check player-wormhole collision (show upgrade menu) - only if player is alive
		if (this.player.health > 0 && this.wormhole && CollisionDetection.checkCircle(this.wormhole, this.player)) {
			this.dispatchEvent(new Event('upgrade-menu-requested'));
			soundManager.play('achievement', 0.5); // Play a sound effect
		}

		// Remove collided entities (unified filtering)
		this.npcs = this.npcs.filter(npc => !npcsToRemove.has(npc));
		this.playerProjectiles = this.playerProjectiles.filter(projectile => !playerProjectilesToRemove.has(projectile));
		this.npcProjectiles = this.npcProjectiles.filter(projectile => !npcProjectilesToRemove.has(projectile));

		// Check for game over - only trigger once
		if (this.player.health <= 0 && this.player.health > -1000) {
			this.gameOver();
			this.player.health = -1000; // Sentinel value to prevent retriggering
			// Don't return - let the game continue running
		}

		// Wrap NPCs that go beyond minimap bounds, despawn projectiles
		const wrapDistance = GameConfig.WORLD.NPC_WRAP_DISTANCE; // Minimap range - wrap NPCs at this distance

		// Wrap all NPCs around minimap edges
		for (const npc of this.npcs) {
			npc.sprite.position.x = this.wrapCoordinate(npc.sprite.position.x, this.player.sprite.position.x, wrapDistance);
			npc.sprite.position.y = this.wrapCoordinate(npc.sprite.position.y, this.player.sprite.position.y, wrapDistance);
		}

		// Despawn projectiles that are too far from player
		this.despawnDistantProjectiles(wrapDistance);

		this.checkGamepadInput(deltaTime);
	}

	gameOver() {
		// Spawn large explosion at player position
		const explosionColor = "255, 100, 50"; // Orange/red color for explosion
		const explosionSize = 120; // Much larger than normal explosions (24)
		const minSpeed = 0.05;
		const maxSpeed = 0.25;
		const lifetime = 3400; // Much longer lasting particles
		const minSize = 3;
		const maxSize = 8;

		for (let i = 0; i < explosionSize; i++) {
			const angle = (Math.PI * 2 * i) / explosionSize + (Math.random() - 0.5) * 0.5;
			const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
			const velocity = new Vector2D(
				Math.cos(angle) * speed,
				Math.sin(angle) * speed
			);
			const size = minSize + Math.random() * (maxSize - minSize);

			this.particleSystem.particles.push(new Particle(
				new Vector2D(this.player.sprite.position.x, this.player.sprite.position.y),
				velocity,
				lifetime,
				explosionColor,
				size
			));
		}

		// Don't stop music - keep playing in menus
		this.dispatchEvent(new Event('game-over'));
	}

	resumeFromUpgrade() {
		// Resume game and advance level
		this.currentState = Game.States.PLAYING;
		menuSystem.hideMenu();
		this.dispatchEvent(new Event('resume-from-upgrade'));
		this.advanceLevel();

		// Update wave progression achievements
		achievementManager.setProgress('warp_speed', this.currentLevel);
		achievementManager.setProgress('deep_space', this.currentLevel);
		achievementManager.setProgress('into_the_void', this.currentLevel);
	}
	
	// Handle ESC key for pause/resume (checked every frame)
	handlePauseInput() {
		if (engine.keyDown["Escape"]) {
			engine.keyDown["Escape"] = false;
			if (this.currentState === Game.States.PLAYING) {
				this.dispatchEvent(new Event('pause-requested'));
			} else if (this.currentState === Game.States.PAUSED) {
				this.dispatchEvent(new Event('resume-requested'));
			}
		}
	}

	checkGamepadInput(deltaTime) {
		// Don't process gamepad input if player is dead
		if (this.player.health <= 0) {
			return;
		}

		const gamepads = navigator.getGamepads();
		const deadzone = GameConfig.PLAYER.GAMEPAD_DEADZONE; // Ignore small stick movements to prevent drift

		for (const gamepad of gamepads) {
			if (!gamepad) continue;

			// Left stick horizontal (axis 0): Turn left/right
			const leftStickX = gamepad.axes[0];
			if (Math.abs(leftStickX) > deadzone) {
				if (leftStickX < 0) {
					this.player.turnLeft(deltaTime * Math.abs(leftStickX));
				} else {
					this.player.turnRight(deltaTime * leftStickX);
				}
			}

			// Right stick vertical (axis 3) or triggers for thrust
			const rightStickY = gamepad.axes[3];
			if (rightStickY < -deadzone) {
				// Right stick pushed up: forward thrust
				this.player.accelerate(deltaTime * Math.abs(rightStickY));
			} else if (rightStickY > deadzone) {
				// Right stick pulled down: reverse thrust
				this.player.reverseThrust(deltaTime * rightStickY);
			}

			// Button 7 (RT/R2): Forward thrust
			if (gamepad.buttons[7] && gamepad.buttons[7].pressed) {
				const triggerValue = gamepad.buttons[7].value || 1.0;
				this.player.accelerate(deltaTime * triggerValue);
			}

			// Button 6 (LT/L2): Reverse thrust
			if (gamepad.buttons[6] && gamepad.buttons[6].pressed) {
				const triggerValue = gamepad.buttons[6].value || 1.0;
				this.player.reverseThrust(deltaTime * triggerValue);
			}

			// Button 0 (A/Cross): Shoot
			if (gamepad.buttons[0] && gamepad.buttons[0].pressed) {
				this.shoot();
			}

			// Button 9 (Start/Options): Pause game
			if (gamepad.buttons[9] && gamepad.buttons[9].pressed) {
				// Debounce by checking if button was just pressed
				if (!gamepad.buttons[9].wasPressed) {
					this.dispatchEvent(new Event('pause-requested'));
					gamepad.buttons[9].wasPressed = true;
				}
			} else if (gamepad.buttons[9]) {
				gamepad.buttons[9].wasPressed = false;
			}
		}
	}

	/**
	* Counts total NPCs currently alive
	* @returns {number} Number of NPCs
	*/
	countNPCs() {
		return this.npcs.length;
	}

	/**
	* Advances to the next level
	* Spawns wormhole when all NPCs are cleared
	*/
	trySpawnWormhole() {
		if (this.countNPCs() === 0 && !this.wormhole) {
			DebugLogger.log(`Wave ${this.currentLevel} cleared! Wormhole spawning...`);
			const wormholeSize = 27 * 3;
			const position = SpawnSystem.getOffscreenSpawnPosition(
				this.player.sprite.position,
				this.canvas.width,
				this.canvas.height,
				wormholeSize,
				28 * 3
			);
			this.wormhole = new Wormhole(position);
		}
	}

	/**
	* Advances to next level via wormhole
	* Clears all projectiles and spawns new wave
	*/
	advanceLevel() {
		this.currentLevel++;
		DebugLogger.log(`Advancing to wave ${this.currentLevel}`);
		this.wormhole = null;

		// Clear all projectiles when transitioning levels
		this.playerProjectiles = [];
		this.npcProjectiles = [];

		// Reset wave-specific achievement tracking
		this.achievementStats.damageTakenThisWave = 0;

		SpawnSystem.spawnWave(
			this.currentLevel,
			this.player.sprite.position,
			this.canvas.width,
			this.canvas.height,
			this.npcs
		);
	}
	
	_cheat_clearLevel() {
		this.npcs = [];
	}
}

export { Game };
