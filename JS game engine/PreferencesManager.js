/**
 * PreferencesManager - Centralized preferences and settings management
 *
 * Responsibilities:
 * - Load/save preferences from/to localStorage
 * - Provide default values
 * - Manage volume settings
 * - Auto-save when preferences change
 */
class PreferencesManager {
  /**
   * Default preference values
   */
  static DEFAULTS = {
    volume_effects: 100,
    volume_music: 100
  };

  /**
   * localStorage key for preferences
   */
  static STORAGE_KEY = 'preferences';

  /**
   * Creates a new preferences manager
   * Automatically loads preferences from localStorage
   */
  constructor() {
    this.preferences = this.load();
  }

  /**
   * Loads preferences from localStorage
   * @returns {Object} Preferences object with defaults for missing values
   */
  load() {
    const stored = localStorage.getItem(PreferencesManager.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all keys exist
        return { ...PreferencesManager.DEFAULTS, ...parsed };
      } catch (e) {
        DebugLogger.error('Failed to parse preferences from localStorage:', e);
        return { ...PreferencesManager.DEFAULTS };
      }
    }
    // Return defaults if nothing stored
    return { ...PreferencesManager.DEFAULTS };
  }

  /**
   * Saves preferences to localStorage
   */
  save() {
    try {
      localStorage.setItem(PreferencesManager.STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (e) {
      DebugLogger.error('Failed to save preferences to localStorage:', e);
    }
  }

  /**
   * Gets sound effects volume (0-100)
   * @returns {number} Sound effects volume percentage
   */
  get soundEffectsVolume() {
    return this.preferences.volume_effects;
  }

  /**
   * Sets sound effects volume (0-100) and auto-saves
   * @param {number} value - Volume percentage (0-100)
   */
  set soundEffectsVolume(value) {
    this.preferences.volume_effects = value;
    this.save();
  }

  /**
   * Gets music volume (0-100)
   * @returns {number} Music volume percentage
   */
  get musicVolume() {
    return this.preferences.volume_music;
  }

  /**
   * Sets music volume (0-100) and auto-saves
   * @param {number} value - Volume percentage (0-100)
   */
  set musicVolume(value) {
    this.preferences.volume_music = value;
    this.save();
  }

  /**
   * Gets a custom preference value
   * @param {string} key - Preference key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} Preference value
   */
  get(key, defaultValue = null) {
    return this.preferences[key] !== undefined ? this.preferences[key] : defaultValue;
  }

  /**
   * Sets a custom preference value and auto-saves
   * @param {string} key - Preference key
   * @param {*} value - Preference value
   */
  set(key, value) {
    this.preferences[key] = value;
    this.save();
  }

  /**
   * Resets all preferences to defaults
   */
  reset() {
    this.preferences = { ...PreferencesManager.DEFAULTS };
    this.save();
  }
}

export { PreferencesManager };
