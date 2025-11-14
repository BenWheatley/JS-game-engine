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

  // Enemy and obstacle spawn timing
  SPAWNING: {
    ALIEN_SCOUT_INTERVAL: 1500,         // Milliseconds between AlienScout spawns
    ALIEN_FIGHTER_INTERVAL: 3000,       // Milliseconds between AlienFighter spawns
    MISSILE_CRUISER_INTERVAL: 5000,     // Milliseconds between MissileCruiser spawns
    ASTEROID_INTERVAL: 2000             // Milliseconds between Asteroid spawns
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
