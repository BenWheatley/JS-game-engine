/**
 * GameConfig - Centralized configuration for all game constants
 *
 * This file contains all magic numbers and configuration values used throughout the game.
 * Organizing constants here makes it easy to tune game balance and behavior.
 */

const GameConfig = {
  // Shared constants used across multiple entity types
  SHARED: {
    SPAWN_MARGIN_MULTIPLIER: 2,         // Spawn distance as multiple of sprite size (offscreen)
    DESPAWN_DISTANCE_MULTIPLIER: 3,     // Distance from player before entity despawns (screen sizes)
    SPRITE_UP_ANGLE_OFFSET: Math.PI / 2 // Sprite faces up at rotation 0, add 90° to get direction
  },

  // NPC AI behavior constants (AlienScout, AlienFighter, MissileCruiser)
  NPC: {
    ARRIVAL_THRESHOLD: 50,              // Distance in pixels to consider target reached
    OFFSCREEN_TIMEOUT: 2000,            // Milliseconds before retargeting when offscreen
    TARGET_AREA_FACTOR: 0.8,            // Fraction of screen radius for target selection (80% = mostly on-screen)
    TURN_PRECISION: 0.01                // Minimum angle difference in radians before turning
  },

  // Asteroid behavior
  ASTEROID: {
    DIRECTION_CONE_HALF_ANGLE: Math.PI / 4, // 45 degrees - random direction variation toward player
    ROTATION_SPEED_LARGE: 0.01,         // Radians per frame for large asteroids
    ROTATION_SPEED_SMALL: 0.02,         // Radians per frame for small asteroid fragments (faster)
    NUM_SPAWNS: 3,                      // Number of fragments created when asteroid is destroyed
    SPAWN_OFFSET_DISTANCE: 20,          // Pixels to offset spawns from parent asteroid position
    SPEED_MIN_FACTOR: 0.3,              // Minimum fragment speed as fraction of parent (30%)
    SPEED_MAX_FACTOR: 0.8               // Maximum fragment speed as fraction of parent (80%)
  },

  // Player physics and controls
  PLAYER: {
    INITIAL_HEALTH: 100,                // Starting health points
    FORWARD_ACCELERATION: 0.002,        // Forward thrust acceleration per millisecond
    BACKWARD_ACCELERATION: 0.0002,      // Reverse thrust acceleration per millisecond (10% of forward)
    MAX_SPEED: 0.08,                    // Maximum velocity magnitude
    ROTATIONAL_SPEED: Math.PI / 1000 * 1.1, // Radians per millisecond (rotation speed)
    FIRE_RATE: 500,                     // Milliseconds between shots (fire cooldown)
    GAMEPAD_DEADZONE: 0.15              // Analog stick deadzone to prevent drift
  },

  // HUD display configuration
  HUD: {
    HEALTH_BAR_WIDTH: 100,              // Health bar width in pixels
    HEALTH_BAR_HEIGHT: 16,              // Health bar height in pixels
    HEALTH_BAR_X: 10,                   // Health bar X position
    HEALTH_BAR_Y: 20,                   // Health bar Y position
    HEALTH_BAR_BG_COLOR: '#FF0000',     // Background color (red - shows damage)
    HEALTH_BAR_FG_COLOR: '#00FF00',     // Foreground color (green - shows current health)
    HEALTH_BAR_BORDER_COLOR: '#FFFFFF', // Border color (white)
    HEALTH_BAR_BORDER_WIDTH: 2          // Border thickness in pixels
  },

  // Wave-based spawning system - defines enemy composition per level
  SPAWNING: {
    // Level progression - defines what spawns at each level
    // Each level specifies counts for: scouts, fighters, cruisers, asteroids
    WAVES: [
      // Level 1: Tutorial - Easy start
      { alienScouts: 3, alienFighters: 0, missileCruisers: 0, asteroids: 2 },

      // Level 2: Introduce fighters
      { alienScouts: 4, alienFighters: 2, missileCruisers: 0, asteroids: 3 },

      // Level 3: More enemies
      { alienScouts: 5, alienFighters: 3, missileCruisers: 0, asteroids: 4 },

      // Level 4: Introduce missile cruisers
      { alienScouts: 6, alienFighters: 4, missileCruisers: 1, asteroids: 4 },

      // Level 5: Ramping up
      { alienScouts: 7, alienFighters: 5, missileCruisers: 2, asteroids: 5 },

      // Level 6: Heavy combat
      { alienScouts: 8, alienFighters: 6, missileCruisers: 2, asteroids: 6 },

      // Level 7: Elite wave
      { alienScouts: 9, alienFighters: 7, missileCruisers: 3, asteroids: 6 },

      // Level 8: Overwhelming force
      { alienScouts: 10, alienFighters: 8, missileCruisers: 4, asteroids: 7 },

      // Level 9: Near impossible
      { alienScouts: 12, alienFighters: 10, missileCruisers: 5, asteroids: 8 },

      // Level 10+: Repeating pattern with scaling
      { alienScouts: 15, alienFighters: 12, missileCruisers: 6, asteroids: 10 }
    ],

    // Scaling factor for levels beyond the wave definitions
    SCALING_FACTOR: 1.15,               // Multiply enemy counts by this for each level beyond wave array
    MAX_LEVEL_INDEX: 9                  // Index of last wave (repeats with scaling after this)
  },

  // Alien Scout - Basic enemy that flies around
  ALIEN_SCOUT: {
    IMAGE_URL: 'alien-scout.png',
    WIDTH: 52,
    HEIGHT: 54,
    HEALTH: 100,
    SCORE_VALUE: 150,
    FORWARD_ACCELERATION: 0.0008,       // Slightly less than player
    MAX_SPEED: 0.05,                    // Slightly less than player
    ROTATIONAL_SPEED: Math.PI / 1200    // Slightly slower rotation than player
  },

  // Alien Fighter - Aggressive enemy that shoots plasma
  ALIEN_FIGHTER: {
    IMAGE_URL: 'alien-fighter.png',
    WIDTH: 52,
    HEIGHT: 50,
    HEALTH: 100,
    SCORE_VALUE: 200,
    FORWARD_ACCELERATION: 0.0016,       // 2x AlienScout
    MAX_SPEED: 0.10,                    // 2x AlienScout
    ROTATIONAL_SPEED: Math.PI / 600,    // 2x AlienScout
    SHOT_COOLDOWN: 2000                 // Milliseconds between shots
  },

  // Missile Cruiser - Heavy enemy that fires homing missiles
  MISSILE_CRUISER: {
    IMAGE_URL: 'missile_ship.png',
    WIDTH: 72,                          // 2x sprite asset size (36x46)
    HEIGHT: 92,
    HEALTH: 200,
    SCORE_VALUE: 300,
    FORWARD_ACCELERATION: 0.0004,       // Slower than AlienScout
    MAX_SPEED: 0.04,                    // Slower than AlienScout
    ROTATIONAL_SPEED: Math.PI / 1500,   // Slower rotation than AlienScout
    SHOT_COOLDOWN: 4000                 // Milliseconds between missile launches
  },

  // Asteroid - Large destructible obstacle
  ASTEROID_BIG: {
    IMAGE_URL: 'asteroid-big.png',
    WIDTH: 52,
    HEIGHT: 52,
    HEALTH: 3,
    SCORE_VALUE: 200,
    SPEED: 0.04                         // Pixels per millisecond (similar to player max speed)
  },

  // Asteroid Spawn - Small fragments from destroyed asteroids
  ASTEROID_SPAWN: {
    IMAGE_URL: 'asteroid-medium.png',
    WIDTH: 27,
    HEIGHT: 26,
    HEALTH: 1,
    SCORE_VALUE: 50
  },

  // Minimap display and configuration
  MINIMAP: {
    SIZE: 150,                          // Minimap width and height in pixels (square)
    RANGE: 1000,                        // World units visible on minimap (radius from player)
    MARGIN: 10,                         // Distance from screen edge in pixels
    BACKGROUND_COLOR: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
    BORDER_COLOR: '#FFFFFF',            // White border
    BORDER_WIDTH: 2,                    // Border thickness in pixels
    PLAYER_COLOR: '#0000FF',            // Blue player indicator
    PLAYER_SIZE: 3,                     // Player indicator radius in pixels
    ENEMY_COLOR: '#FF0000',             // Red enemy indicators
    ENEMY_SIZE_LARGE: 4,                // Large enemy/asteroid indicator size (width/height)
    ENEMY_SIZE_SMALL: 2,                // Small asteroid spawn indicator size
    ASTEROID_COLOR: '#FFFFFF'           // White asteroid indicators
  },

  // World boundaries and wrapping
  WORLD: {
    // NPCs wrap at minimap edge - this should match MINIMAP.RANGE
    get NPC_WRAP_DISTANCE() {
      return GameConfig.MINIMAP.RANGE;  // Automatically uses minimap range
    },
    PROJECTILE_DESPAWN_MULTIPLIER: 2    // Projectile despawn distance as multiple of screen size
  }
};
