import { DebugLogger } from './DebugLogger.js';
import { Sprite } from './Sprite.js';

/**
 * AssetLoader - Centralized asset loading system
 *
 * Responsibilities:
 * - Define all game assets in one location
 * - Load sprites, sounds, and music
 * - Provide unified loading interface
 */
class AssetLoader {
  /**
   * Sprite asset file names
   */
  static SPRITES = [
    'background-fuzzy-edge.png',
    'title.png',
    'player-ship.png',
    'alien-scout.png',
    'alien-fighter.png',
    'alien-saucer.png',
    'alien-battleship.png',
    'alien-carrier.png',
    'missile_ship.png',
    'asteroid-big.png',
    'asteroid-medium.png',
    'asteroid-small.png',
    'laser.png',
    'plasma.png',
    'missile.png',
    'wormhole.png'
  ];

  /**
   * Sound effect asset definitions
   * Maps sound effect names to file names
   */
  static SOUNDS = {
    'shoot': 'laser_1.2.m4a',
    'explosion': 'explosion_medium.m4a',
    'hit': 'explosion_small.m4a',
    'missile_launcher': 'missile_launcher.m4a',
    'sine_sweep_80_to_120': 'sine_sweep_80_to_120.m4a',
    'battleship-mega-laser': 'battleship-mega-laser.m4a',
    'launch-fighter': 'launch-fighter.m4a',
  };

  /**
   * Music file name
   */
  static MUSIC = 'slow_guitar.json';

  /**
   * Loads all game assets (sprites, sounds, music)
   * @param {SoundManager} soundManager - Sound manager instance
   * @param {MusicPlayer} musicPlayer - Music player instance
   * @returns {Promise<void>} Promise that resolves when all assets are loaded
   */
  static async loadAll(soundManager, musicPlayer) {
    DebugLogger.log('Loading assets...');

    // Load all asset types in parallel
    await Promise.all([
      AssetLoader.loadSprites(),
      AssetLoader.loadSounds(soundManager),
      AssetLoader.loadMusic(musicPlayer)
    ]);

    DebugLogger.log('All assets loaded successfully!');
  }

  /**
   * Loads sprite assets
   * @returns {Promise<void>}
   */
  static async loadSprites() {
    await Sprite.preloadSprites(AssetLoader.SPRITES);
    DebugLogger.log(`Loaded ${AssetLoader.SPRITES.length} sprites`);
  }

  /**
   * Loads sound effect assets
   * @param {SoundManager} soundManager - Sound manager instance
   * @returns {Promise<void>}
   */
  static async loadSounds(soundManager) {
    await soundManager.loadSounds(AssetLoader.SOUNDS);
    DebugLogger.log(`Loaded ${Object.keys(AssetLoader.SOUNDS).length} sound effects`);
  }

  /**
   * Loads music assets
   * @param {MusicPlayer} musicPlayer - Music player instance
   * @returns {Promise<void>}
   */
  static async loadMusic(musicPlayer) {
    await musicPlayer.loadMusic(AssetLoader.MUSIC);
    DebugLogger.log('Music loaded');
  }
}

export { AssetLoader };
