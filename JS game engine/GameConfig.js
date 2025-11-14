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
    HEALTH: 100,                        // Starting health points
    FORWARD_ACCELERATION: 0.002,        // Forward thrust acceleration per millisecond
    BACKWARD_ACCELERATION: 0.0002,      // Reverse thrust acceleration per millisecond (10% of forward)
    MAX_SPEED: 0.08,                    // Maximum velocity magnitude
    ROTATIONAL_SPEED: Math.PI / 1000 * 1.1, // Radians per millisecond (rotation speed)
    FIRE_RATE: 500,                     // Milliseconds between shots (fire cooldown)
    GAMEPAD_DEADZONE: 0.15              // Analog stick deadzone to prevent drift
  },

  // Enemy and obstacle spawn timing
  SPAWNING: {
    ALIEN_SCOUT_INTERVAL: 1500,         // Milliseconds between AlienScout spawns
    ALIEN_FIGHTER_INTERVAL: 3000,       // Milliseconds between AlienFighter spawns
    MISSILE_CRUISER_INTERVAL: 5000,     // Milliseconds between MissileCruiser spawns
    ASTEROID_INTERVAL: 2000             // Milliseconds between Asteroid spawns
  },

  // World boundaries and wrapping
  WORLD: {
    NPC_WRAP_DISTANCE: 1000,            // Distance from player where NPCs wrap to opposite edge (minimap range)
    PROJECTILE_DESPAWN_MULTIPLIER: 2    // Projectile despawn distance as multiple of screen size
  }
};
