class Game {
	// Render loop
	render() {
		// Special rendering for upgrade menu
		if (gameState.currentState === GameState.States.UPGRADING) {
			gameState.upgradeBackground.draw(context, canvas.width, canvas.height, gameState.player.sprite.position);
			return; // Menu overlay will render on top
		}
		
		// I want the blocky look for this game; strictly this doesn't need to be set every frame, but it doesn't hurt to be every frame
		context.imageSmoothingEnabled = false;

		// Background
		context.fillStyle = 'black';
		context.fillRect(0, 0, canvas.width, canvas.height);

		context.save();
		context.translate(
			canvas.width/2-gameState.player.sprite.position.x,
			canvas.height/2-gameState.player.sprite.position.y
		);

		// Draw tiled background
		const tileWidth = backgroundTileSize.x * 0.9;
		const tileHeight = backgroundTileSize.y * 0.85;

		// Calculate which tiles are visible
		const startX = Math.floor((gameState.player.sprite.position.x - canvas.width) / tileWidth) * tileWidth;
		const startY = Math.floor((gameState.player.sprite.position.y - canvas.height) / tileHeight) * tileHeight;
		const endX = Math.ceil((gameState.player.sprite.position.x + canvas.width) / tileWidth) * tileWidth;
		const endY = Math.ceil((gameState.player.sprite.position.y + canvas.height) / tileHeight) * tileHeight;

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
		if (gameState.wormhole) {
			gameState.wormhole.draw();
		}

		// Shots
		for (const projectile of gameState.playerProjectiles) {
			projectile.draw();
		}
		for (const projectile of gameState.npcProjectiles) {
			projectile.draw();
		}

		// NPCs
		for (const npc of gameState.npcs) {
			npc.draw();
		}

		// Particles
		gameState.particleSystem.draw(context);

		// Player last (top layer) - don't draw if dead
		if (gameState.player.health > 0) {
			gameState.player.draw();
		}

		context.restore();

		// HUD - render in screen space
		// Health bar
		const healthBarWidth = gameState.player.maxHealth;
		const healthBarHeight = GameConfig.HUD.HEALTH_BAR_HEIGHT;
		const healthBarX = GameConfig.HUD.HEALTH_BAR_X;
		const healthBarY = GameConfig.HUD.HEALTH_BAR_Y;

		// Draw health bar background (red - shows damage)
		context.fillStyle = GameConfig.HUD.HEALTH_BAR_BG_COLOR;
		context.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

		// Draw health bar foreground (green - shows current health)
		const healthPercentage = Math.max(0, Math.min(1, gameState.player.health / gameState.player.maxHealth));
		const currentHealthWidth = healthBarWidth * healthPercentage;
		context.fillStyle = GameConfig.HUD.HEALTH_BAR_FG_COLOR;
		context.fillRect(healthBarX, healthBarY, currentHealthWidth, healthBarHeight);

		// Draw health bar border (white)
		context.strokeStyle = GameConfig.HUD.HEALTH_BAR_BORDER_COLOR;
		context.lineWidth = GameConfig.HUD.HEALTH_BAR_BORDER_WIDTH;
		context.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

		// Draw score
		context.fillStyle = '#FFFFFF';
		context.font = '12px "Press Start 2P"';
		context.textAlign = 'left';
		context.fillText(`Score: ${gameState.score}`, 10, 60);

		// Mini-map
		gameState.minimap.draw(context, {
			npcs: gameState.npcs,
			wormhole: gameState.wormhole
		}, gameState.player.sprite.position);

		// Wormhole message and arrow
		if (gameState.wormhole) {
			// Draw message with stroke
			context.font = '16px "Press Start 2P"';
			context.textAlign = 'center';
			// Draw white stroke (outline)
			context.strokeStyle = '#000000';
			context.lineWidth = 2;
			context.strokeText('Wormhole detected!', canvas.width / 2, 50);
			// Draw cyan fill
			context.fillStyle = '#00FFFF';
			context.fillText('Wormhole detected!', canvas.width / 2, 50);

			// Calculate direction to wormhole
			const dx = gameState.wormhole.position.x - gameState.player.sprite.position.x;
			const dy = gameState.wormhole.position.y - gameState.player.sprite.position.y;
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
				// Draw white stroke (outline)
				context.strokeStyle = '#000000';
				context.lineWidth = 2;
				context.beginPath();
				context.moveTo(15, 0);
				context.lineTo(-10, -10);
				context.lineTo(-10, 10);
				context.closePath();
				context.stroke();
				// Draw cyan fill
				context.fillStyle = '#00FFFF';
				context.beginPath();
				context.moveTo(15, 0);
				context.lineTo(-10, -10);
				context.lineTo(-10, 10);
				context.closePath();
				context.fill();
				context.restore();
			}
		}
	}
	
	// Helper: Update all projectiles
	updateAllProjectiles() {
		for (const projectile of gameState.playerProjectiles) {
			projectile.update();
		}
		for (const projectile of gameState.npcProjectiles) {
			projectile.update();
		}
	}

	// Helper: Despawn projectiles that are too far from player
	despawnDistantProjectiles(despawnDistance) {
		const filterByDistance = (projectile) => {
			const distance = projectile.sprite.position.dist(gameState.player.sprite.position);
			return distance < despawnDistance;
		};
		gameState.playerProjectiles = gameState.playerProjectiles.filter(filterByDistance);
		gameState.npcProjectiles = gameState.npcProjectiles.filter(filterByDistance);
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
		const weaponStats = gameState.player.getWeaponStats();
		const spreadRadians = weaponStats.spreadAngle * (Math.PI / 180);
		const shotPosition = new Vector2D(
			gameState.player.sprite.position.x,
			gameState.player.sprite.position.y
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
			if (gameState.gameTime > gameState.lastShotTime[projectileType] + effectiveCooldown) {
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
					let shotAngle = gameState.player.sprite.rotation;
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

					gameState.playerProjectiles.push(newShot);
				}
			}

			// Update last shot time for all weapon types that fired
			for (const weaponType of weaponTypesReady) {
				gameState.lastShotTime[weaponType] = gameState.gameTime;
			}

			// Play sound
			this.playSoundEffect('shoot', 0.3);
		}
	}

	// Helper function for handling NPC destruction
	handleNPCDestroyed(npc) {
		// Add score
		gameState.score += npc.scoreValue;

		// Spawn explosion particles
		gameState.particleSystem.spawnExplosion(npc.sprite.position, npc.particleColor);

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
		if (gameState.currentState === GameState.States.UPGRADING) {
			gameState.upgradeBackground.update(deltaTime);
			gameState.gameTime += deltaTime; // Time passes during upgrade menu
			return;
		}

		// Only update game logic during active gameplay
		if (gameState.currentState !== GameState.States.PLAYING) {
			return;
		}
		// Accumulate game time (only advances during gameplay, not when paused)
		gameState.gameTime += deltaTime;

		// Only process player input if player is alive
		if (gameState.player.health > 0) {
			if (engine.keyDown["ArrowLeft"]) {
				gameState.player.turnLeft(deltaTime);
			}
			if (engine.keyDown["ArrowRight"]) {
				gameState.player.turnRight(deltaTime);
			}
			if (engine.keyDown["ArrowUp"]) {
				gameState.player.accelerate(deltaTime);
			}
			if (engine.keyDown["ArrowDown"]) {
				gameState.player.reverseThrust(deltaTime);
			}
			if (engine.keyDown[" "]) {
				this.shoot();
			}

			gameState.player.update(deltaTime);
			gameState.player.updateShieldRegen(deltaTime); // Update shield regeneration
		}

		// Update all NPCs with unified loop
		for (const npc of gameState.npcs) {
			// All NPCs accept playerPosition (asteroids ignore it)
			npc.update(deltaTime, gameState.player.sprite.position);

			// Handle NPC shooting (unified)
			if (npc.tryShoot) {
				const shootResult = npc.tryShoot(gameState.gameTime);
				if (shootResult && shootResult.shots) {
					gameState.npcProjectiles.push(...shootResult.shots);
					if (shootResult.sound) {
						this.playSoundEffect(shootResult.sound, shootResult.volume);
					}
				}
			}
		}

		// Update all projectiles
		this.updateAllProjectiles();

		// Update particles
		gameState.particleSystem.update(deltaTime);

		// Update wormhole if it exists
		if (gameState.wormhole) {
			gameState.wormhole.update(deltaTime);
			gameState.wormhole.wrap(gameState.player.sprite.position);
		}

		// Wave-based spawning: Spawn wormhole when wave cleared
		gameState.trySpawnWormhole();

		// Collision detection
		const npcsToRemove = new Set();
		const playerProjectilesToRemove = new Set();
		const npcProjectilesToRemove = new Set();

		// Check player shot collisions with all NPCs (unified loop)
		for (const shot of gameState.playerProjectiles) {
			for (const npc of gameState.npcs) {
				if (CollisionDetection.checkAABB(shot, npc)) {
					playerProjectilesToRemove.add(shot);

					// Spawn impact particles and sound from shot properties
					if (shot.particleColor) {
						gameState.particleSystem.spawnImpact(shot.sprite.position, shot.particleColor);
					}
					if (shot.hitSound) {
						this.playSoundEffect(shot.hitSound, shot.hitVolume);
					}

					// Check if NPC is offscreen for Sniper achievement
					const npcScreenX = npc.sprite.position.x - gameState.player.sprite.position.x + canvas.width / 2;
					const npcScreenY = npc.sprite.position.y - gameState.player.sprite.position.y + canvas.height / 2;
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
							gameState.npcs.push(...hitResult.spawns);
						}
					}
					if (hitResult.sound) {
						this.playSoundEffect(hitResult.sound, hitResult.volume);
					}
				}
			}
		}

		// Check player-NPC collisions (unified loop) - only if player is alive
		if (gameState.player.health > 0) {
			for (const npc of gameState.npcs) {
				if (CollisionDetection.checkAABB(gameState.player, npc)) {
					npcsToRemove.add(npc);

					const collisionResult = npc.onCollideWithPlayer();
					DebugLogger.log(`Player-NPC collision! NPC type: ${npc.constructor.name}, NPC health: ${npc.health}, collision damage: ${collisionResult.damage}, player health before: ${gameState.player.health}`);

					// Handle NPC destruction (score, particles, centurion achievement)
					this.handleNPCDestroyed(npc);

					// Apply damage to player
					gameState.player.health -= collisionResult.damage;
					gameState.player.onDamage(); // Reset shield regen timer
					DebugLogger.log(`Player health after: ${gameState.player.health}`);

					if (collisionResult.sound) {
						this.playSoundEffect(collisionResult.sound, collisionResult.volume);
					}

					// Track collision kills for demolition_derby achievement
					achievementManager.progress('demolition_derby', 1);

					// Track damage taken for untouchable achievement
					gameState.achievementStats.damageTakenThisWave += collisionResult.damage;
				}
			}
		}

		// Check NPC projectile-player collisions (unified loop) - only if player is alive
		if (gameState.player.health > 0) {
			for (const projectile of gameState.npcProjectiles) {
				if (CollisionDetection.checkAABB(gameState.player, projectile)) {
					npcProjectilesToRemove.add(projectile);

					const hitResult = projectile.onHitPlayer();
					gameState.player.health -= hitResult.damage;
					gameState.player.onDamage(); // Reset shield regen timer
					DebugLogger.log(`Player hit by projectile! Health: ${gameState.player.health}`);

					if (hitResult.sound) {
						this.playSoundEffect(hitResult.sound, hitResult.volume);
					}

					if (hitResult.particleColor) {
						gameState.particleSystem.spawnExplosion(projectile.sprite.position, hitResult.particleColor);
					}

					// Track damage taken for untouchable achievement
					gameState.achievementStats.damageTakenThisWave += hitResult.damage;
				}
			}
		}

		// Check player-wormhole collision (show upgrade menu) - only if player is alive
		if (gameState.player.health > 0 && gameState.wormhole && CollisionDetection.checkCircle(gameState.wormhole, gameState.player)) {
			showUpgradeMenu();
			this.playSoundEffect('achievement', 0.5); // Play a sound effect
		}

		// Remove collided entities (unified filtering)
		gameState.npcs = gameState.npcs.filter(npc => !npcsToRemove.has(npc));
		gameState.playerProjectiles = gameState.playerProjectiles.filter(projectile => !playerProjectilesToRemove.has(projectile));
		gameState.npcProjectiles = gameState.npcProjectiles.filter(projectile => !npcProjectilesToRemove.has(projectile));

		// Check for game over - only trigger once
		if (gameState.player.health <= 0 && gameState.player.health > -1000) {
			this.gameOver();
			gameState.player.health = -1000; // Sentinel value to prevent retriggering
			// Don't return - let the game continue running
		}

		// Wrap NPCs that go beyond minimap bounds, despawn projectiles
		const wrapDistance = GameConfig.WORLD.NPC_WRAP_DISTANCE; // Minimap range - wrap NPCs at this distance
		const despawnDistance = Math.max(canvas.width, canvas.height) * GameConfig.WORLD.PROJECTILE_DESPAWN_MULTIPLIER; // Despawn projectiles

		// Wrap all NPCs around minimap edges
		for (const npc of gameState.npcs) {
			npc.sprite.position.x = this.wrapCoordinate(npc.sprite.position.x, gameState.player.sprite.position.x, wrapDistance);
			npc.sprite.position.y = this.wrapCoordinate(npc.sprite.position.y, gameState.player.sprite.position.y, wrapDistance);
		}

		// Despawn projectiles that are too far from player
		this.despawnDistantProjectiles(despawnDistance);

		this.checkGamepadInput(deltaTime);
	}

	gameOver() {
		// Spawn large explosion at player position
		const explosionColor = "255, 100, 50"; // Orange/red color for explosion
		const explosionSize = 120; // Much larger than normal explosions (24)
		const minSpeed = 0.05;
		const maxSpeed = 0.25;
		const lifetime = 2400; // Much longer lasting particles
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

			gameState.particleSystem.particles.push(new Particle(
				new Vector2D(gameState.player.sprite.position.x, gameState.player.sprite.position.y),
				velocity,
				lifetime,
				size,
				explosionColor
			));
		}

		// Don't stop music - keep playing in menus
		setCursorVisibility(true);
		showGameOverMenu();
	}

	resumeFromUpgrade() {
		// Resume game and advance level
		gameState.currentState = GameState.States.PLAYING;
		menuSystem.hideMenu();
		musicPlayer.play();
		setCursorVisibility(false);
		gameState.advanceLevel();

		// Update wave progression achievements
		achievementManager.setProgress('warp_speed', gameState.currentLevel);
		achievementManager.setProgress('deep_space', gameState.currentLevel);
		achievementManager.setProgress('into_the_void', gameState.currentLevel);
	}
	
	// Handle ESC key for pause/resume (checked every frame)
	handlePauseInput() {
		if (engine.keyDown["Escape"]) {
			engine.keyDown["Escape"] = false;
			if (gameState.currentState === GameState.States.PLAYING) {
				pauseGame();
			} else if (gameState.currentState === GameState.States.PAUSED) {
				resumeGame();
			}
		}
	}

	checkGamepadInput(deltaTime) {
		// Don't process gamepad input if player is dead
		if (gameState.player.health <= 0) {
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
					gameState.player.turnLeft(deltaTime * Math.abs(leftStickX));
				} else {
					gameState.player.turnRight(deltaTime * leftStickX);
				}
			}

			// Right stick vertical (axis 3) or triggers for thrust
			const rightStickY = gamepad.axes[3];
			if (rightStickY < -deadzone) {
				// Right stick pushed up: forward thrust
				gameState.player.accelerate(deltaTime * Math.abs(rightStickY));
			} else if (rightStickY > deadzone) {
				// Right stick pulled down: reverse thrust
				gameState.player.reverseThrust(deltaTime * rightStickY);
			}

			// Button 7 (RT/R2): Forward thrust
			if (gamepad.buttons[7] && gamepad.buttons[7].pressed) {
				const triggerValue = gamepad.buttons[7].value || 1.0;
				gameState.player.accelerate(deltaTime * triggerValue);
			}

			// Button 6 (LT/L2): Reverse thrust
			if (gamepad.buttons[6] && gamepad.buttons[6].pressed) {
				const triggerValue = gamepad.buttons[6].value || 1.0;
				gameState.player.reverseThrust(deltaTime * triggerValue);
			}

			// Button 0 (A/Cross): Shoot
			if (gamepad.buttons[0] && gamepad.buttons[0].pressed) {
				this.shoot();
			}

			// Button 9 (Start/Options): Pause game
			if (gamepad.buttons[9] && gamepad.buttons[9].pressed) {
				// Debounce by checking if button was just pressed
				if (!gamepad.buttons[9].wasPressed) {
					pauseGame();
					gamepad.buttons[9].wasPressed = true;
				}
			} else if (gamepad.buttons[9]) {
				gamepad.buttons[9].wasPressed = false;
			}
		}
	}

	// Helper function to apply volume
	playSoundEffect(name, baseVolume) {
		soundManager.play(name, baseVolume * (preferencesManager.soundEffectsVolume / 100));
	}
}