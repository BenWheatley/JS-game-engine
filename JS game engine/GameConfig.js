/**
 * GameConfig - Centralized configuration for all game constants
 *
 * This file contains all magic numbers and configuration values used throughout the game.
 * Organizing constants here makes it easy to tune game balance and behavior.
 */

// Import entity classes for dynamic instantiation
import { AlienScout } from './AlienScout.js';
import { AlienFighter } from './AlienFighter.js';
import { MissileCruiser } from './MissileCruiser.js';
import { AlienSaucer } from './AlienSaucer.js';
import { AlienBattleship } from './AlienBattleship.js';
import { AlienCarrier } from './AlienCarrier.js';
import { Asteroid } from './Asteroid.js';

const GameConfig = {
  // Shared constants used across multiple entity types
  SHARED: {
    SPAWN_MARGIN_MULTIPLIER: 2,         // Spawn distance as multiple of sprite size (offscreen)
    SPRITE_UP_ANGLE_OFFSET: Math.PI / 2 // Sprite faces up at rotation 0, add 90° to get direction
  },

  // NPC AI behavior constants (AlienScout, AlienFighter, MissileCruiser)
  NPC: {
    ARRIVAL_THRESHOLD: 50,              // Distance in pixels to consider target reached
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
    FORWARD_ACCELERATION: 0.002,        // Forward thrust acceleration per millisecond
    BACKWARD_ACCELERATION: 0.0002,      // Reverse thrust acceleration per millisecond (10% of forward)
    MAX_SPEED: 0.1,                    // Maximum velocity magnitude
    ROTATIONAL_SPEED: Math.PI / 1000 * 1.1, // Radians per millisecond (rotation speed)
    FIRE_RATE: 500,                     // Milliseconds between shots (fire cooldown)
    GAMEPAD_DEADZONE: 0.15              // Analog stick deadzone to prevent drift
  },

  // Upgrade progression tables
  UPGRADES: {
    // Weapon upgrades - affects fire rate, projectile count, spread, and projectile types
    // Each level: { fireRate, spreadAngle (in degrees), projectileTypes (array) }
    // projectileTypes: array of 'laser', 'plasma', or 'missile' for each shot (center outward)
    WEAPON: [
      { fireRate: 500, spreadAngle: 0, projectileTypes: ['laser'] },                           // Level 0 (starting)
      { fireRate: 400, spreadAngle: 0, projectileTypes: ['laser'] },                           // Level 1: Faster fire
      { fireRate: 400, spreadAngle: 5, projectileTypes: ['laser', 'laser'] },                  // Level 2: Dual shot
      { fireRate: 300, spreadAngle: 5, projectileTypes: ['laser', 'laser'] },                  // Level 3: Even faster
      { fireRate: 300, spreadAngle: 10, projectileTypes: ['laser', 'laser', 'laser'] },        // Level 4: Triple shot
      { fireRate: 300, spreadAngle: 10, projectileTypes: ['laser', 'plasma', 'laser'] },       // Level 5: Center plasma
      { fireRate: 300, spreadAngle: 15, projectileTypes: ['laser', 'plasma', 'plasma', 'laser'] }, // Level 6: Quad shot
      { fireRate: 250, spreadAngle: 15, projectileTypes: ['laser', 'plasma', 'plasma', 'laser'] }, // Level 7: Max fire rate
      { fireRate: 250, spreadAngle: 20, projectileTypes: ['laser', 'plasma', 'plasma', 'plasma', 'laser'] }, // Level 8: Penta shot with center plasma
      { fireRate: 200, spreadAngle: 20, projectileTypes: ['laser', 'plasma', 'plasma', 'plasma', 'laser'] }, // Level 9: Ultra rapid
      { fireRate: 200, spreadAngle: 25, projectileTypes: ['missile', 'laser', 'plasma', 'laser', 'missile'] } // Level 10: Outer missiles
    ],

    // Engine upgrades - affects movement stats
    // Each level: { maxSpeedMultiplier, accelerationMultiplier, rotationMultiplier }
    ENGINE: [
      { maxSpeedMultiplier: 1.0, accelerationMultiplier: 1.0, rotationMultiplier: 1.0 },     // Level 0
      { maxSpeedMultiplier: 1.2, accelerationMultiplier: 1.0, rotationMultiplier: 1.0 },     // Level 1: +20% speed
      { maxSpeedMultiplier: 1.2, accelerationMultiplier: 1.0, rotationMultiplier: 1.2 },     // Level 2: +20% turn
      { maxSpeedMultiplier: 1.2, accelerationMultiplier: 1.2, rotationMultiplier: 1.2 },     // Level 3: +20% accel
      { maxSpeedMultiplier: 1.44, accelerationMultiplier: 1.2, rotationMultiplier: 1.2 },    // Level 4: +20% speed
      { maxSpeedMultiplier: 1.44, accelerationMultiplier: 1.2, rotationMultiplier: 1.44 },   // Level 5: +20% turn
      { maxSpeedMultiplier: 1.44, accelerationMultiplier: 1.44, rotationMultiplier: 1.44 },  // Level 6: +20% accel
      { maxSpeedMultiplier: 1.728, accelerationMultiplier: 1.44, rotationMultiplier: 1.44 }, // Level 7: +20% speed
      { maxSpeedMultiplier: 1.728, accelerationMultiplier: 1.44, rotationMultiplier: 1.728 },// Level 8: +20% turn
      { maxSpeedMultiplier: 1.728, accelerationMultiplier: 1.728, rotationMultiplier: 1.728 },// Level 9: +20% accel
      { maxSpeedMultiplier: 2.074, accelerationMultiplier: 2.074, rotationMultiplier: 2.074 } // Level 10: Final boost
    ],

    // Shield upgrades - affects max health and regeneration
    // Each level: { maxHealth, regenRate (HP/sec), regenDelay (seconds) }
    SHIELD: [
      { maxHealth: 100, regenRate: 0, regenDelay: 0 },
      { maxHealth: 200, regenRate: 1, regenDelay: 4 },
      { maxHealth: 200, regenRate: 2, regenDelay: 3 },
      { maxHealth: 300, regenRate: 3, regenDelay: 3 },
      { maxHealth: 300, regenRate: 4, regenDelay: 2.5 },
      { maxHealth: 400, regenRate: 5, regenDelay: 2.5 },
      { maxHealth: 400, regenRate: 6, regenDelay: 2 },
      { maxHealth: 500, regenRate: 7, regenDelay: 2 },
      { maxHealth: 500, regenRate: 8, regenDelay: 1.5 },
      { maxHealth: 600, regenRate: 9, regenDelay: 1.5 },
      { maxHealth: 700, regenRate: 10, regenDelay: 1 }
    ]
  },

  // HUD display configuration
  HUD: {
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
    // Each level specifies counts for: scouts, fighters, cruisers, saucers, battleships, carriers, asteroids
    WAVES: [
      // Level 1: Tutorial - Easy start
      { alienScouts: 3, alienFighters: 0, missileCruisers: 0, alienSaucers: 0, alienBattleships: 1, alienCarriers: 1, asteroids: 2 },

      // Level 2: Introduce fighters
      { alienScouts: 4, alienFighters: 2, missileCruisers: 0, alienSaucers: 0, alienBattleships: 0, alienCarriers: 0, asteroids: 3 },

      // Level 3: More enemies
      { alienScouts: 5, alienFighters: 3, missileCruisers: 0, alienSaucers: 0, alienBattleships: 0, alienCarriers: 0, asteroids: 4 },

      // Level 4: Introduce alien saucers
      { alienScouts: 6, alienFighters: 4, missileCruisers: 0, alienSaucers: 1, alienBattleships: 0, alienCarriers: 0, asteroids: 4 },

      // Level 5: Ramping up
      { alienScouts: 7, alienFighters: 5, missileCruisers: 0, alienSaucers: 1, alienBattleships: 0, alienCarriers: 0, asteroids: 5 },

      // Level 6: Heavy combat
      { alienScouts: 8, alienFighters: 6, missileCruisers: 0, alienSaucers: 1, alienBattleships: 0, alienCarriers: 0, asteroids: 6 },

      // Level 7: Elite wave
      { alienScouts: 9, alienFighters: 7, missileCruisers: 0, alienSaucers: 2, alienBattleships: 0, alienCarriers: 0, asteroids: 6 },

      // Level 8: Introduce missile cruisers
      { alienScouts: 10, alienFighters: 8, missileCruisers: 1, alienSaucers: 2, alienBattleships: 0, alienCarriers: 0, asteroids: 7 },

      // Level 9: Near impossible
      { alienScouts: 12, alienFighters: 10, missileCruisers: 2, alienSaucers: 3, alienBattleships: 0, alienCarriers: 0, asteroids: 8 },

      // Level 10+: Repeating pattern with scaling
      { alienScouts: 15, alienFighters: 12, missileCruisers: 3, alienSaucers: 3, alienBattleships: 0, alienCarriers: 0, asteroids: 10 }
    ],

    // Scaling factor for levels beyond the wave definitions
    SCALING_FACTOR: 1.15,               // Multiply enemy counts by this for each level beyond wave array

    // Entity type mapping - maps wave keys to entity classes and configs
    ENTITY_TYPES: {
      alienScouts: { class: AlienScout, config: 'ALIEN_SCOUT' },
      alienFighters: { class: AlienFighter, config: 'ALIEN_FIGHTER' },
      missileCruisers: { class: MissileCruiser, config: 'MISSILE_CRUISER' },
      alienSaucers: { class: AlienSaucer, config: 'ALIEN_SAUCER' },
      alienBattleships: { class: AlienBattleship, config: 'ALIEN_BATTLESHIP' },
      alienCarriers: { class: AlienCarrier, config: 'ALIEN_CARRIER' },
      asteroids: { class: Asteroid, config: 'ASTEROID_BIG' }
    }
  },

  // Alien Scout - Basic enemy that flies around
  ALIEN_SCOUT: {
    IMAGE_URL: 'alien-scout.png',
    WIDTH: 52,
    HEIGHT: 54,
    HEALTH: 10,
    SCORE_VALUE: 10,
    FORWARD_ACCELERATION: 0.0008,       // Slightly less than player
    MAX_SPEED: 0.05,                    // Slightly less than player
    ROTATIONAL_SPEED: Math.PI / 1200,   // Slightly slower rotation than player
    HIT_SOUND: 'hit',                   // Sound when hit but not destroyed
    HIT_VOLUME: 0.3,                    // Volume for hit sound
    DESTROYED_SOUND: 'explosion',       // Sound when destroyed
    DESTROYED_VOLUME: 0.5,              // Volume for destruction sound
    PARTICLE_COLOR: '255, 150, 50',     // Orange particle color
    COLLISION_SOUND: 'hit',             // Sound when colliding with player
    COLLISION_VOLUME: 0.6               // Volume for collision sound
  },

  // Alien Fighter - Aggressive enemy that shoots plasma
  ALIEN_FIGHTER: {
    IMAGE_URL: 'alien-fighter.png',
    WIDTH: 52,
    HEIGHT: 50,
    HEALTH: 20,
    SCORE_VALUE: 20,
    FORWARD_ACCELERATION: 0.0016,       // 2x AlienScout
    MAX_SPEED: 0.10,                    // 2x AlienScout
    ROTATIONAL_SPEED: Math.PI / 600,    // 2x AlienScout
    SHOT_COOLDOWN: 2000,                // Milliseconds between shots
    SHOOT_SOUND: 'shoot',               // Sound effect to play when shooting
    SHOOT_VOLUME: 0.2,                  // Volume for shoot sound (0.0 - 1.0)
    HIT_SOUND: 'hit',                   // Sound when hit but not destroyed
    HIT_VOLUME: 0.3,                    // Volume for hit sound
    DESTROYED_SOUND: 'explosion',       // Sound when destroyed
    DESTROYED_VOLUME: 0.5,              // Volume for destruction sound
    PARTICLE_COLOR: '255, 150, 50',     // Orange particle color
    COLLISION_SOUND: 'hit',             // Sound when colliding with player
    COLLISION_VOLUME: 0.6               // Volume for collision sound
  },

  // Missile Cruiser - Heavy enemy that fires missiles
  MISSILE_CRUISER: {
    IMAGE_URL: 'missile_ship.png',
    WIDTH: 72,                          // 2x sprite asset size (36x46)
    HEIGHT: 92,
    HEALTH: 200,
    SCORE_VALUE: 200,
    SHOW_HEALTH_BAR: true,              // Display health bar above sprite
    FORWARD_ACCELERATION: 0.0004,       // Slower than AlienScout
    MAX_SPEED: 0.04,                    // Slower than AlienScout
    ROTATIONAL_SPEED: Math.PI / 1500,   // Slower rotation than AlienScout
    SHOT_COOLDOWN: 4000,                // Milliseconds between missile launches
    SHOOT_SOUND: 'missile_launcher',    // Sound effect to play when shooting
    SHOOT_VOLUME: 0.3,                  // Volume for shoot sound (0.0 - 1.0)
    HIT_SOUND: 'hit',                   // Sound when hit but not destroyed
    HIT_VOLUME: 0.4,                    // Volume for hit sound
    DESTROYED_SOUND: 'explosion',       // Sound when destroyed
    DESTROYED_VOLUME: 0.6,              // Volume for destruction sound
    PARTICLE_COLOR: '255, 150, 50',     // Orange particle color
    COLLISION_SOUND: 'hit',             // Sound when colliding with player
    COLLISION_VOLUME: 0.7               // Volume for collision sound
  },

  // Alien Saucer - Flying saucer with ease-in-out movement
  ALIEN_SAUCER: {
    IMAGE_URL: 'alien-saucer.png',
    WIDTH: 64,
    HEIGHT: 64,
    HEALTH: 100,
    SCORE_VALUE: 500,
    SHOW_HEALTH_BAR: true,              // Display health bar above sprite
    MOVEMENT_DURATION: 4500,            // Milliseconds to reach target
    STOP_DURATION: 2000,                // Milliseconds to stay stopped (2 seconds)
    SHOOT_SOUND: 'shoot',               // Sound effect to play when shooting
    SHOOT_VOLUME: 0.3,                  // Volume for shoot sound (0.0 - 1.0)
    HIT_SOUND: 'hit',                   // Sound when hit but not destroyed
    HIT_VOLUME: 0.4,                    // Volume for hit sound
    DESTROYED_SOUND: 'explosion',       // Sound when destroyed
    DESTROYED_VOLUME: 0.5,              // Volume for destruction sound
    PARTICLE_COLOR: '255, 150, 50',     // Orange particle color
    COLLISION_SOUND: 'hit',             // Sound when colliding with player
    COLLISION_VOLUME: 0.6               // Volume for collision sound
  },

  // Alien Battleship (Siege Destroyer) - Heavy ship with charge-up beam weapon
  ALIEN_BATTLESHIP: {
    IMAGE_URL: 'alien-battleship.png',
    WIDTH: 96,
    HEIGHT: 96,
    HEALTH: 450,
    SCORE_VALUE: 550,
    SHOW_HEALTH_BAR: true,              // Display health bar above sprite
    FORWARD_ACCELERATION: 0.0005,       // Slow acceleration
    MAX_SPEED: 0.05,                    // 0.5x player speed
    ROTATIONAL_SPEED: Math.PI / 1800,   // Slow rotation
    CHARGE_DURATION: 1500,              // Milliseconds to charge beam before firing
    BEAM_DURATION: 1000,                // Milliseconds beam stays active
    BEAM_COOLDOWN: 4000,                // Milliseconds between beam attacks
    BEAM_DAMAGE: 75,                    // Damage dealt by beam
    BEAM_WIDTH: 50,                     // Beam width in pixels
    BEAM_LENGTH: 2400,                  // Beam length in pixels
    CHARGE_SOUND: 'charge',             // Sound effect during charge-up (TODO: add asset)
    CHARGE_VOLUME: 0.4,                 // Volume for charge sound
    BEAM_SOUND: 'beam',                 // Sound effect during beam fire (TODO: add asset)
    BEAM_VOLUME: 0.5,                   // Volume for beam sound
    HIT_SOUND: 'hit',                   // Sound when hit but not destroyed
    HIT_VOLUME: 0.5,                    // Volume for hit sound
    DESTROYED_SOUND: 'explosion',       // Sound when destroyed
    DESTROYED_VOLUME: 0.7,              // Volume for destruction sound
    PARTICLE_COLOR: '255, 150, 50',     // Orange particle color
    COLLISION_SOUND: 'hit',             // Sound when colliding with player
    COLLISION_VOLUME: 0.8               // Volume for collision sound
  },

  // Alien Carrier - Spawns fighters when on-screen
  ALIEN_CARRIER: {
    IMAGE_URL: 'alien-carrier.png',
    WIDTH: 128,
    HEIGHT: 128,
    HEALTH: 600,
    SCORE_VALUE: 800,
    SHOW_HEALTH_BAR: true,              // Display health bar above sprite
    FORWARD_ACCELERATION: 0.0002,       // Very slow acceleration
    MAX_SPEED: 0.02,                    // 0.2x player speed (slowest ship)
    ROTATIONAL_SPEED: Math.PI / 2400,   // Very slow rotation
    SPAWN_COOLDOWN: 8000,               // Milliseconds between fighter spawns
    SPAWN_COUNT: 2,                     // Number of fighters spawned per cycle
    MAX_SPAWNED_FIGHTERS: 6,            // Maximum active spawned fighters
    VISIBILITY_MARGIN: -50,             // Negative margin = must be on-screen (not off-screen)
    SPAWN_SOUND: 'spawn',               // Sound effect when spawning (TODO: add asset)
    SPAWN_VOLUME: 0.4,                  // Volume for spawn sound
    HIT_SOUND: 'hit',                   // Sound when hit but not destroyed
    HIT_VOLUME: 0.6,                    // Volume for hit sound
    DESTROYED_SOUND: 'explosion',       // Sound when destroyed
    DESTROYED_VOLUME: 0.8,              // Volume for destruction sound
    PARTICLE_COLOR: '255, 150, 50',     // Orange particle color
    COLLISION_SOUND: 'hit',             // Sound when colliding with player
    COLLISION_VOLUME: 0.9               // Volume for collision sound
  },

  // Asteroid - Large destructible obstacle
  ASTEROID_BIG: {
    IMAGE_URL: 'asteroid-big.png',
    WIDTH: 52,
    HEIGHT: 52,
    HEALTH: 30,
    SCORE_VALUE: 30,
    SPEED: 0.04,                        // Pixels per millisecond (similar to player max speed)
    HIT_SOUND: 'hit',                   // Sound when hit but not destroyed
    HIT_VOLUME: 0.4,                    // Volume for hit sound
    DESTROYED_SOUND: 'explosion',       // Sound when destroyed
    DESTROYED_VOLUME: 0.5,              // Volume for destruction sound
    PARTICLE_COLOR: '255, 150, 50',     // Orange particle color
    COLLISION_SOUND: 'hit',             // Sound when colliding with player
    COLLISION_VOLUME: 0.6               // Volume for collision sound
  },

  // Asteroid Spawn - Small fragments from destroyed asteroids
  ASTEROID_SPAWN: {
    IMAGE_URL: 'asteroid-medium.png',
    WIDTH: 27,
    HEIGHT: 26,
    HEALTH: 10,
    SCORE_VALUE: 10,
    DESTROYED_SOUND: 'explosion',       // Sound when destroyed
    DESTROYED_VOLUME: 0.3,              // Volume for destruction sound
    PARTICLE_COLOR: '255, 150, 50',     // Orange particle color for small asteroids
    COLLISION_SOUND: 'hit',             // Sound when colliding with player
    COLLISION_VOLUME: 0.4               // Volume for collision sound
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
  },

  // Projectile types
  LASER: {
    DAMAGE: 10,                         // Damage dealt
    HIT_SOUND: 'hit',                   // Sound when hitting target
    HIT_VOLUME: 0.3,                    // Volume for hit sound
    PARTICLE_COLOR: '255, 200, 100'     // Yellow/orange impact particles
  },

  PLASMA: {
    DAMAGE: 25,                         // Damage dealt
    HIT_SOUND: 'hit',                   // Sound when hitting target
    HIT_VOLUME: 0.5,                    // Volume for hit sound
    PARTICLE_COLOR: '50, 150, 255'      // Blue/cyan particles
  },

  MISSILE: {
    DAMAGE: 50,                         // Damage dealt
    HIT_SOUND: 'explosion',             // Sound when hitting target
    HIT_VOLUME: 0.6,                    // Volume for hit sound
    PARTICLE_COLOR: '255, 100, 50'      // Orange explosion particles
  },

  // Achievement definitions
  // trackProgress: true enables progress tracking and display
  // maxProgress: target value for completion (null for instant/binary achievements)
  ACHIEVEMENTS: [
    {
      id: 'demolition_derby',
      name: 'Demolition Derby',
      description: 'Destroy 30 aliens or asteroids by ramming them',
      trackProgress: true,
      maxProgress: 30
    },
    {
      id: 'centurion',
      name: 'Centurion',
      description: 'Destroy 100 aliens in total',
      trackProgress: true,
      maxProgress: 100
    },
    {
      id: 'untouchable',
      name: 'Untouchable',
      description: 'Complete a wave without taking any damage',
      trackProgress: false,
      maxProgress: null
    },
    {
      id: 'warp_speed',
      name: 'Warp Speed',
      description: 'Reach wave 5',
      trackProgress: true,
      maxProgress: 5
    },
    {
      id: 'deep_space',
      name: 'Deep Space',
      description: 'Reach wave 10',
      trackProgress: true,
      maxProgress: 10
    },
    {
      id: 'into_the_void',
      name: 'Into the Void',
      description: 'Reach wave 15',
      trackProgress: true,
      maxProgress: 15
    },
    {
      id: 'fully_armed',
      name: 'Fully Armed',
      description: 'Max out weapon upgrades (level 10)',
      trackProgress: true,
      maxProgress: 10
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Max out engine upgrades (level 10)',
      trackProgress: true,
      maxProgress: 10
    },
    {
      id: 'fortress',
      name: 'Fortress',
      description: 'Max out shield upgrades (level 10)',
      trackProgress: true,
      maxProgress: 10
    },
    {
      id: 'ultimate_weapon',
      name: 'Ultimate Weapon',
      description: 'Max out all three upgrade paths',
      trackProgress: false,
      maxProgress: null
    },
    {
      id: 'sniper',
      name: 'Sniper',
      description: 'Hit an enemy that\'s offscreen',
      trackProgress: false,
      maxProgress: null
    }
  ]
};

export { GameConfig };
