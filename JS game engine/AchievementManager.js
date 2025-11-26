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
   * @returns {Object} Map of achievement ID to unlock data {unlocked: boolean, timestamp: number, progress: number}
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
        timestamp: null,
        progress: 0  // Current progress value
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

    // Show toast notification
    this.showToast(achievementId);

    return true;
  }

  /**
   * Shows a toast notification for an unlocked achievement
   * @param {string} achievementId - ID of achievement to display
   */
  showToast(achievementId) {
    // Find achievement config
    const achievement = GameConfig.ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) {
      return;
    }

    // Get or create toast container
    let container = document.getElementById('achievementToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'achievementToastContainer';
      document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';

    toast.innerHTML = `
      <div class="achievement-toast-icon">✓</div>
      <div class="achievement-toast-content">
        <div class="achievement-toast-title">Achievement Unlocked</div>
        <div class="achievement-toast-name">${achievement.name}</div>
        <div class="achievement-toast-description">${achievement.description}</div>
      </div>
    `;

    container.appendChild(toast);

    // Remove toast after animation completes (4 seconds total)
    setTimeout(() => {
      toast.remove();
    }, 4000);
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
   * Increments progress for an achievement
   * @param {string} achievementId - ID of achievement to update
   * @param {number} amount - Amount to increment by (default: 1)
   */
  progress(achievementId, amount = 1) {
    if (!this.achievements[achievementId]) {
      DebugLogger.error(`Unknown achievement ID: ${achievementId}`);
      return;
    } else {
      DebugLogger.log(`Progress: ${achievementId}`)
    }

    // Don't track progress for already unlocked achievements
    if (this.achievements[achievementId].unlocked) {
      return;
    }

    // Find achievement config
    const config = GameConfig.ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!config || !config.trackProgress) {
      return;
    }

    // Increment progress
    this.achievements[achievementId].progress += amount;
    this.saveAchievements();

    // Check if achievement should unlock
    if (this.achievements[achievementId].progress >= config.maxProgress) {
      this.unlock(achievementId);
    }
  }

  /**
   * Sets absolute progress for an achievement (instead of incrementing)
   * @param {string} achievementId - ID of achievement to update
   * @param {number} value - Absolute progress value
   */
  setProgress(achievementId, value) {
    if (!this.achievements[achievementId]) {
      DebugLogger.error(`Unknown achievement ID: ${achievementId}`);
      return;
    } else {
      DebugLogger.log(`Set progress: ${achievementId}`)
    }

    // Don't track progress for already unlocked achievements
    if (this.achievements[achievementId].unlocked) {
      return;
    }

    // Find achievement config
    const config = GameConfig.ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!config || !config.trackProgress) {
      return;
    }

    // Set progress
    this.achievements[achievementId].progress = value;
    this.saveAchievements();

    // Check if achievement should unlock
    if (this.achievements[achievementId].progress >= config.maxProgress) {
      this.unlock(achievementId);
    }
  }

  /**
   * Gets current progress for an achievement
   * @param {string} achievementId - ID of achievement
   * @returns {number} Current progress value
   */
  getProgress(achievementId) {
    return this.achievements[achievementId]?.progress || 0;
  }

  /**
   * Resets all achievements (for testing)
   */
  resetAll() {
    for (const achievementId in this.achievements) {
      this.achievements[achievementId].unlocked = false;
      this.achievements[achievementId].timestamp = null;
      this.achievements[achievementId].progress = 0;
    }
    this.saveAchievements();
    DebugLogger.log('All achievements reset');
  }
}

export { AchievementManager };
