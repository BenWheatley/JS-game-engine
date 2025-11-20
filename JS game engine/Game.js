/**
 * Game - Main game logic and state management
 *
 * Handles:
 * - Game initialization and state
 * - Player shooting
 * - Collision detection
 * - Game loop (update/render)
 * - NPC destruction
 * - Level progression
 */
class Game {
  constructor(canvas, context, menuSystem, soundManager, musicPlayer, preferencesManager, achievementManager) {
    this.canvas = canvas;
    this.context = context;
    this.menuSystem = menuSystem;
    this.soundManager = soundManager;
    this.musicPlayer = musicPlayer;
    this.preferencesManager = preferencesManager;
    this.achievementManager = achievementManager;

    this.gameState = new GameState(canvas);
    this.backgroundSprite = null;
    this.backgroundTileSize = null;

    // Track game stats for achievements
    this.gameStats = {
      finalScore: 0,
      levelsCompleted: 0
    };
  }

  /**
   * Helper to play sound effects with volume adjustment
   */
  playSoundEffect(name, baseVolume) {
    this.soundManager.play(name, baseVolume * (this.preferencesManager.soundEffectsVolume / 100));
  }

  /**
   * Sets cursor visibility
   */
  setCursorVisibility(visible) {
    if (visible) {
      this.canvas.classList.remove('hide-cursor');
    } else {
      this.canvas.classList.add('hide-cursor');
    }
  }

  /**
   * Initialize and start a new game
   */
  async startGame() {
    this.gameState.reset();
    this.gameState.currentState = GameState.States.PLAYING;
    this.menuSystem.hideMenu();
    this.musicPlayer.play();
    this.setCursorVisibility(false);
  }

  /**
   * Handle player death - spawn explosion and show game over menu
   */
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

      this.gameState.particleSystem.particles.push(new Particle(
        new Vector2D(this.gameState.player.sprite.position.x, this.gameState.player.sprite.position.y),
        velocity,
        lifetime,
        explosionColor,
        size
      ));
    }

    // Don't stop music - keep playing in menus
    this.setCursorVisibility(true);

    // Store reference for menu callbacks
    this.gameStats.finalScore = this.gameState.score;
    this.gameStats.levelsCompleted = this.gameState.currentLevel - 1;
  }

  /**
   * Handle NPC destruction - score, particles, achievements
   */
  handleNPCDestroyed(npc) {
    this.gameState.score += npc.scoreValue;
    this.gameState.particleSystem.spawnExplosion(npc.sprite.position, npc.particleColor);

    // Track alien kills for Centurion achievement (not asteroids)
    if (npc.constructor.name !== 'Asteroid' && npc.constructor.name !== 'AsteroidSpawn') {
      this.achievementManager.progress('centurion', 1);
    }
  }

  /**
   * Player shooting function
   */
  shoot() {
    const weaponStats = this.gameState.player.getWeaponStats();
    const spreadRadians = weaponStats.spreadAngle * (Math.PI / 180);
    const shotPosition = new Vector2D(
      this.gameState.player.sprite.position.x,
      this.gameState.player.sprite.position.y
    );

    // Determine which weapon types are ready to fire
    const weaponTypesReady = new Set();
    for (let i = 0; i < weaponStats.projectileTypes.length; i++) {
      const projectileType = weaponStats.projectileTypes[i];
      let cooldownMultiplier = 1;
      if (projectileType === 'missile') {
        cooldownMultiplier = 3;
      }
      const effectiveCooldown = weaponStats.fireRate * cooldownMultiplier;

      if (this.gameState.gameTime > this.gameState.lastShotTime[projectileType] + effectiveCooldown) {
        weaponTypesReady.add(projectileType);
      }
    }

    // Fire all weapon slots whose types are ready
    if (weaponTypesReady.size > 0) {
      for (let i = 0; i < weaponStats.projectileTypes.length; i++) {
        const projectileType = weaponStats.projectileTypes[i];

        if (weaponTypesReady.has(projectileType)) {
          // Calculate angle for this weapon slot
          const slotOffset = i - (weaponStats.projectileTypes.length - 1) / 2;
          const angleOffset = slotOffset * spreadRadians;
          let shotAngle = this.gameState.player.sprite.rotation;

          // Only apply angle offset if there are multiple weapons (prevent jitter with single weapon)
          if (weaponStats.projectileTypes.length > 1) {
            shotAngle += angleOffset;
          }

          // Create the projectile based on type
          let newShot;
          switch (projectileType) {
            case 'laser':
              newShot = new Laser(shotPosition, shotAngle);
              break;
            case 'plasma':
              newShot = new Plasma(shotPosition, shotAngle);
              break;
            case 'missile':
              newShot = new Missile(shotPosition, shotAngle);
              break;
            default:
              DebugLogger.error(`Unknown projectile type: ${projectileType}`);
              continue;
          }

          this.gameState.playerProjectiles.push(newShot);
        }
      }

      // Update last shot time for all weapon types that fired
      for (const weaponType of weaponTypesReady) {
        this.gameState.lastShotTime[weaponType] = this.gameState.gameTime;
      }
      this.playSoundEffect('shoot', 0.3);
    }
  }

  /**
   * Update all projectiles (both player and NPC)
   */
  updateAllProjectiles(deltaTime) {
    for (const projectile of this.gameState.playerProjectiles) {
      projectile.update(deltaTime);
    }

    for (const projectile of this.gameState.npcProjectiles) {
      projectile.update(deltaTime);
    }
  }

  /**
   * Despawn projectiles that are too far from player
   */
  despawnDistantProjectiles(despawnDistance) {
    this.gameState.playerProjectiles = this.gameState.playerProjectiles.filter(projectile => {
      const distance = projectile.sprite.position.dist(this.gameState.player.sprite.position);
      return distance <= despawnDistance;
    });

    this.gameState.npcProjectiles = this.gameState.npcProjectiles.filter(projectile => {
      const distance = projectile.sprite.position.dist(this.gameState.player.sprite.position);
      return distance <= despawnDistance;
    });
  }

  /**
   * Wrap coordinate around world bounds
   */
  wrapCoordinate(coord, playerCoord, wrapDistance) {
    const offset = coord - playerCoord;
    if (offset > wrapDistance) {
      return playerCoord - wrapDistance + (offset - wrapDistance);
    } else if (offset < -wrapDistance) {
      return playerCoord + wrapDistance + (offset + wrapDistance);
    }
    return coord;
  }

  /**
   * Check gamepad input for player controls
   */
  checkGamepadInput(deltaTime) {
    // Don't process gamepad input if player is dead
    if (this.gameState.player.health <= 0) {
      return;
    }

    const gamepads = navigator.getGamepads();
    const deadzone = GameConfig.PLAYER.GAMEPAD_DEADZONE;

    for (const gamepad of gamepads) {
      if (!gamepad) continue;

      // Left stick horizontal (axis 0): Turn left/right
      const leftStickX = gamepad.axes[0];
      if (Math.abs(leftStickX) > deadzone) {
        if (leftStickX < 0) {
          this.gameState.player.turnLeft(deltaTime * Math.abs(leftStickX));
        } else {
          this.gameState.player.turnRight(deltaTime * leftStickX);
        }
      }

      // Right stick vertical (axis 3) or triggers for thrust
      const rightStickY = gamepad.axes[3];
      if (rightStickY < -deadzone) {
        this.gameState.player.accelerate(deltaTime * Math.abs(rightStickY));
      } else if (rightStickY > deadzone) {
        this.gameState.player.reverseThrust(deltaTime * rightStickY);
      }

      // Button 7 (RT/R2): Forward thrust
      if (gamepad.buttons[7] && gamepad.buttons[7].pressed) {
        const triggerValue = gamepad.buttons[7].value || 1.0;
        this.gameState.player.accelerate(deltaTime * triggerValue);
      }

      // Button 6 (LT/L2): Reverse thrust
      if (gamepad.buttons[6] && gamepad.buttons[6].pressed) {
        const triggerValue = gamepad.buttons[6].value || 1.0;
        this.gameState.player.reverseThrust(deltaTime * triggerValue);
      }

      // Button 0 (A/Cross): Shoot
      if (gamepad.buttons[0] && gamepad.buttons[0].pressed) {
        this.shoot();
      }

      // Button 9 (Start/Options): Pause game
      if (gamepad.buttons[9] && gamepad.buttons[9].pressed) {
        if (!gamepad.buttons[9].wasPressed) {
          // Pause is handled externally
          gamepad.buttons[9].wasPressed = true;
        }
      } else if (gamepad.buttons[9]) {
        gamepad.buttons[9].wasPressed = false;
      }
    }
  }

  /**
   * Main game update loop
   */
  update(deltaTime, engine) {
    // Handle gamepad input for menu navigation (runs even in menus)
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        this.menuSystem.handleGamepadInput(gamepads[i]);
        break;
      }
    }

    // Update particle system even when paused (for menu effects)
    this.gameState.particleSystem.update(deltaTime);

    // Special handling for upgrade menu
    if (this.gameState.currentState === GameState.States.UPGRADING) {
      this.gameState.gameTime += deltaTime;
      return;
    }

    // Only update game logic during active gameplay
    if (this.gameState.currentState !== GameState.States.PLAYING) {
      return;
    }

    // Accumulate game time
    this.gameState.gameTime += deltaTime;

    // Only process player input if player is alive
    if (this.gameState.player.health > 0) {
      if (engine.keyDown["ArrowLeft"]) {
        this.gameState.player.turnLeft(deltaTime);
      }
      if (engine.keyDown["ArrowRight"]) {
        this.gameState.player.turnRight(deltaTime);
      }
      if (engine.keyDown["ArrowUp"]) {
        this.gameState.player.accelerate(deltaTime);
      }
      if (engine.keyDown["ArrowDown"]) {
        this.gameState.player.reverseThrust(deltaTime);
      }
      if (engine.keyDown[" "]) {
        this.shoot();
      }

      this.gameState.player.update(deltaTime);
      this.gameState.player.updateShieldRegen(deltaTime);
    }

    // Update all NPCs
    for (const npc of this.gameState.npcs) {
      npc.update(deltaTime, this.gameState.player.sprite.position);
    }

    // Update wormhole if exists
    if (this.gameState.wormhole) {
      this.gameState.wormhole.update(deltaTime);
      this.gameState.wormhole.wrap(this.gameState.player.sprite.position);
    }

    // Update all projectiles
    this.updateAllProjectiles(deltaTime);

    // Collision detection
    const npcsToRemove = new Set();
    const playerProjectilesToRemove = new Set();
    const npcProjectilesToRemove = new Set();

    // Check player shot-NPC collisions
    for (const shot of this.gameState.playerProjectiles) {
      for (const npc of this.gameState.npcs) {
        if (CollisionDetection.checkAABB(shot, npc)) {
          playerProjectilesToRemove.add(shot);

          // Spawn impact particles and sound
          if (shot.particleColor) {
            this.gameState.particleSystem.spawnImpact(shot.sprite.position, shot.particleColor);
          }
          if (shot.hitSound) {
            this.playSoundEffect(shot.hitSound, shot.hitVolume);
          }

          // Check if NPC is offscreen for Sniper achievement
          const npcScreenX = npc.sprite.position.x - this.gameState.player.sprite.position.x + this.canvas.width / 2;
          const npcScreenY = npc.sprite.position.y - this.gameState.player.sprite.position.y + this.canvas.height / 2;
          const isOffscreen = npcScreenX < 0 || npcScreenX > this.canvas.width ||
                              npcScreenY < 0 || npcScreenY > this.canvas.height;

          if (isOffscreen) {
            this.achievementManager.unlock('sniper');
          }

          DebugLogger.log(`Shot damage: ${shot.damage}, NPC type: ${npc.constructor.name}, NPC health before: ${npc.health}`);
          const hitResult = npc.onHit(shot.damage);
          DebugLogger.log(`Hit result destroyed: ${hitResult.destroyed}, NPC health after: ${npc.health}`);

          if (hitResult.destroyed) {
            npcsToRemove.add(npc);
            this.handleNPCDestroyed(npc);

            // Handle spawns (asteroid splitting)
            if (hitResult.spawns) {
              this.gameState.npcs.push(...hitResult.spawns);
            }
          }
          if (hitResult.sound) {
            this.playSoundEffect(hitResult.sound, hitResult.volume);
          }
        }
      }
    }

    // Check player-NPC collisions - only if player is alive
    if (this.gameState.player.health > 0) {
      for (const npc of this.gameState.npcs) {
        if (CollisionDetection.checkAABB(this.gameState.player, npc)) {
          npcsToRemove.add(npc);

          const collisionResult = npc.onCollideWithPlayer();
          DebugLogger.log(`Player-NPC collision! NPC type: ${npc.constructor.name}, collision damage: ${collisionResult.damage}`);

          // Handle NPC destruction
          this.handleNPCDestroyed(npc);

          // Apply damage to player
          this.gameState.player.health -= collisionResult.damage;
          this.gameState.player.onDamage();
          DebugLogger.log(`Player health after: ${this.gameState.player.health}`);

          if (collisionResult.sound) {
            this.playSoundEffect(collisionResult.sound, collisionResult.volume);
          }

          // Track collision kills for demolition_derby achievement
          this.achievementManager.progress('demolition_derby', 1);

          // Track damage taken for untouchable achievement
          this.gameState.achievementStats.damageTakenThisWave += collisionResult.damage;
        }
      }
    }

    // Check NPC projectile-player collisions - only if player is alive
    if (this.gameState.player.health > 0) {
      for (const projectile of this.gameState.npcProjectiles) {
        if (CollisionDetection.checkAABB(this.gameState.player, projectile)) {
          npcProjectilesToRemove.add(projectile);

          const hitResult = projectile.onHitPlayer();
          this.gameState.player.health -= hitResult.damage;
          this.gameState.player.onDamage();
          DebugLogger.log(`Player hit by projectile! Health: ${this.gameState.player.health}`);

          if (hitResult.sound) {
            this.playSoundEffect(hitResult.sound, hitResult.volume);
          }

          if (hitResult.particleColor) {
            this.gameState.particleSystem.spawnExplosion(projectile.sprite.position, hitResult.particleColor);
          }

          // Track damage taken for untouchable achievement
          this.gameState.achievementStats.damageTakenThisWave += hitResult.damage;
        }
      }
    }

    // Check player-wormhole collision - only if player is alive
    if (this.gameState.player.health > 0 && this.gameState.wormhole && CollisionDetection.checkCircle(this.gameState.wormhole, this.gameState.player)) {
      // Wormhole collision handled externally (shows upgrade menu)
      this.playSoundEffect('achievement', 0.5);
      return { wormholeCollision: true };
    }

    // Remove collided entities
    this.gameState.npcs = this.gameState.npcs.filter(npc => !npcsToRemove.has(npc));
    this.gameState.playerProjectiles = this.gameState.playerProjectiles.filter(projectile => !playerProjectilesToRemove.has(projectile));
    this.gameState.npcProjectiles = this.gameState.npcProjectiles.filter(projectile => !npcProjectilesToRemove.has(projectile));

    // Check for game over - only trigger once
    if (this.gameState.player.health <= 0 && this.gameState.player.health > -1000) {
      this.gameOver();
      this.gameState.player.health = -1000; // Sentinel value
      return { gameOver: true };
    }

    // Wrap NPCs and despawn distant projectiles
    const wrapDistance = GameConfig.WORLD.NPC_WRAP_DISTANCE;
    const despawnDistance = Math.max(this.canvas.width, this.canvas.height) * GameConfig.WORLD.PROJECTILE_DESPAWN_MULTIPLIER;

    for (const npc of this.gameState.npcs) {
      npc.sprite.position.x = this.wrapCoordinate(npc.sprite.position.x, this.gameState.player.sprite.position.x, wrapDistance);
      npc.sprite.position.y = this.wrapCoordinate(npc.sprite.position.y, this.gameState.player.sprite.position.y, wrapDistance);
    }

    this.despawnDistantProjectiles(despawnDistance);

    // Try to spawn wormhole if wave cleared
    this.gameState.trySpawnWormhole();

    this.checkGamepadInput(deltaTime);

    return null;
  }

  /**
   * Main game render loop
   */
  render() {
    // Special rendering for upgrade menu
    if (this.gameState.currentState === GameState.States.UPGRADING) {
      this.gameState.upgradeBackground.draw(this.context, this.canvas.width, this.canvas.height, this.gameState.player.sprite.position);
      return;
    }

    this.context.imageSmoothingEnabled = false;

    // Background
    this.context.fillStyle = 'black';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.save();
    this.context.translate(
      this.canvas.width / 2 - this.gameState.player.sprite.position.x,
      this.canvas.height / 2 - this.gameState.player.sprite.position.y
    );

    // Draw tiled background
    const tileWidth = this.backgroundTileSize.x * 0.9;
    const tileHeight = this.backgroundTileSize.y * 0.85;

    const startX = Math.floor((this.gameState.player.sprite.position.x - this.canvas.width) / tileWidth) * tileWidth;
    const startY = Math.floor((this.gameState.player.sprite.position.y - this.canvas.height) / tileHeight) * tileHeight;
    const endX = Math.ceil((this.gameState.player.sprite.position.x + this.canvas.width) / tileWidth) * tileWidth;
    const endY = Math.ceil((this.gameState.player.sprite.position.y + this.canvas.height) / tileHeight) * tileHeight;

    this.context.globalCompositeOperation = 'lighten';
    for (let x = startX; x <= endX; x += tileWidth) {
      for (let y = startY; y <= endY; y += tileHeight) {
        this.backgroundSprite.position.x = x + tileWidth / 2;
        this.backgroundSprite.position.y = y + tileHeight / 2;
        this.backgroundSprite.draw();
      }
    }
    this.context.globalCompositeOperation = 'source-over';

    // Z-order: Wormhole first
    if (this.gameState.wormhole) {
      this.gameState.wormhole.draw();
    }

    // Projectiles
    for (const projectile of this.gameState.playerProjectiles) {
      projectile.draw();
    }
    for (const projectile of this.gameState.npcProjectiles) {
      projectile.draw();
    }

    // NPCs
    for (const npc of this.gameState.npcs) {
      npc.draw();
    }

    // Particles
    this.gameState.particleSystem.draw(this.context);

    // Player last - don't draw if dead
    if (this.gameState.player.health > 0) {
      this.gameState.player.draw();
    }

    this.context.restore();

    // HUD - render in screen space
    const healthBarWidth = this.gameState.player.maxHealth;
    const healthBarHeight = GameConfig.HUD.HEALTH_BAR_HEIGHT;
    const healthBarX = GameConfig.HUD.HEALTH_BAR_X;
    const healthBarY = GameConfig.HUD.HEALTH_BAR_Y;

    // Draw health bar background (red - shows damage)
    this.context.fillStyle = 'rgba(200, 0, 0, 0.8)';
    this.context.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    // Draw current health (green)
    const healthPercentage = Math.max(0, Math.min(1, this.gameState.player.health / this.gameState.player.maxHealth));
    this.context.fillStyle = 'rgba(0, 200, 0, 0.8)';
    this.context.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);

    // Draw health bar border
    this.context.strokeStyle = 'white';
    this.context.lineWidth = 2;
    this.context.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

    // Draw score
    const scoreX = GameConfig.HUD.SCORE_X;
    const scoreY = GameConfig.HUD.SCORE_Y;
    this.context.fillStyle = 'white';
    this.context.font = '16px "Press Start 2P"';
    this.context.fillText(`Score: ${this.gameState.score}`, scoreX, scoreY);

    // Draw level
    const levelX = GameConfig.HUD.LEVEL_X;
    const levelY = GameConfig.HUD.LEVEL_Y;
    this.context.fillText(`Wave: ${this.gameState.currentLevel}`, levelX, levelY);

    // Draw minimap
    this.gameState.minimap.draw(this.context, {
      player: this.gameState.player.sprite.position,
      npcs: this.gameState.npcs.map(npc => ({
        position: npc.sprite.position,
        type: npc.constructor.name
      })),
      wormhole: this.gameState.wormhole ? this.gameState.wormhole.position : null
    }, this.gameState.player.sprite.position);
  }
}
