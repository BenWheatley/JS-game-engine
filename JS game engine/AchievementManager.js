/**
 * AchievementManager - Tracks and persists player achievements
 *
 * Manages achievement unlocking and storage in localStorage.
 * Each achievement has a unique ID and tracks unlock status and timestamp.
 */
class AchievementManager {
  static STORAGE_KEY = 'spaceShooterAchievements';

  /**
   * Creates a new achievement manager
   * @param {MenuSystem} menuSystem - Reference to menu system for displaying notifications
   */
  constructor(menuSystem) {
    this.menuSystem = menuSystem;
    this.achievements = this.loadAchievements();
  }

  /**
   * Loads achievements from localStorage
   * @returns {Object} Map of achievement ID to unlock data {unlocked: boolean, timestamp: number}
   */
  loadAchievements() {
    try {
      const saved = localStorage.getItem(AchievementManager.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      DebugLogger.error('Failed to load achievements:', error);
    }

    // Initialize with all achievements locked
    const achievements = {};
    for (const achievement of GameConfig.ACHIEVEMENTS) {
      achievements[achievement.id] = {
        unlocked: false,
        timestamp: null
      };
    }
    return achievements;
  }

  /**
   * Saves achievements to localStorage
   */
  saveAchievements() {
    try {
      localStorage.setItem(AchievementManager.STORAGE_KEY, JSON.stringify(this.achievements));
    } catch (error) {
      DebugLogger.error('Failed to save achievements:', error);
    }
  }

  /**
   * Unlocks an achievement if not already unlocked
   * @param {string} achievementId - ID of achievement to unlock
   * @returns {boolean} True if newly unlocked, false if already unlocked
   */
  unlock(achievementId) {
    if (!this.achievements[achievementId]) {
      DebugLogger.error(`Unknown achievement ID: ${achievementId}`);
      return false;
    }

    if (this.achievements[achievementId].unlocked) {
      return false; // Already unlocked
    }

    this.achievements[achievementId].unlocked = true;
    this.achievements[achievementId].timestamp = Date.now();
    this.saveAchievements();

    DebugLogger.log(`Achievement unlocked: ${achievementId}`);
    return true;
  }

  /**
   * Checks if an achievement is unlocked
   * @param {string} achievementId - ID of achievement to check
   * @returns {boolean} True if unlocked
   */
  isUnlocked(achievementId) {
    return this.achievements[achievementId]?.unlocked || false;
  }

  /**
   * Gets unlock timestamp for an achievement
   * @param {string} achievementId - ID of achievement
   * @returns {number|null} Timestamp or null if not unlocked
   */
  getUnlockTime(achievementId) {
    return this.achievements[achievementId]?.timestamp || null;
  }

  /**
   * Gets total number of unlocked achievements
   * @returns {number} Count of unlocked achievements
   */
  getUnlockedCount() {
    return Object.values(this.achievements).filter(a => a.unlocked).length;
  }

  /**
   * Gets total number of achievements
   * @returns {number} Total achievement count
   */
  getTotalCount() {
    return GameConfig.ACHIEVEMENTS.length;
  }

  /**
   * Resets all achievements (for testing)
   */
  resetAll() {
    for (const achievementId in this.achievements) {
      this.achievements[achievementId].unlocked = false;
      this.achievements[achievementId].timestamp = null;
    }
    this.saveAchievements();
    DebugLogger.log('All achievements reset');
  }
}
