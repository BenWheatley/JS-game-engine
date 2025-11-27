import { MenuSystem } from './MenuSystem.js';

/**
 * HighScoreManager - Manages high score storage, retrieval, and display
 *
 * Handles:
 * - Local storage persistence
 * - Input sanitization (XSS prevention)
 * - Score sorting and ranking
 * - High scores menu display with smart truncation
 */
class HighScoreManager {
  constructor(menuSystem, showMainMenuCallback) {
    this.menuSystem = menuSystem;
    this.showMainMenuCallback = showMainMenuCallback;
    this.storageKey = 'highScores';
  }

  /**
   * Sanitizes user input to prevent XSS attacks
   * Removes HTML tags and dangerous characters while supporting international names
   * Allows Unicode letters (all languages), numbers, spaces, and safe punctuation
   * @param {string} input - Raw user input
   * @returns {string} Sanitized string safe for display
   */
  sanitizeInput(input) {
    if (!input) return '';

    // Convert to string and trim
    let sanitized = String(input).trim();

    // Remove any HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // As this is all local, I don't care about "dangerous Unicode ranges" where "danger" is limited to spoofing

    // Remove remaining angle brackets to prevent any HTML/script injection
    sanitized = sanitized.replace(/[<>]/g, '');

    // Allow: Unicode letters (\p{L}), numbers (\p{N}), combining marks (\p{M} for accents),
    // spaces, and safe punctuation (.-_')
    // This supports names in Chinese (中文), Japanese (日本語), Arabic (العربية),
    // Hindi (हिन्दी), Cyrillic (Русский), Greek (Ελληνικά), etc.
    sanitized = sanitized.replace(/[^\p{L}\p{N}\p{M}\s.\-_']/gu, '');

    // Limit consecutive spaces to single space
    sanitized = sanitized.replace(/\s+/g, ' ');

    // Trim again after replacements
    sanitized = sanitized.trim();

    return sanitized;
  }

  /**
   * Retrieves all high scores from local storage
   * @returns {Array} Array of score objects {name, score, date}
   */
  getHighScores() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return [];

    const scores = JSON.parse(stored);
    // Sanitize all names when loading (defense against legacy data)
    return scores.map(score => ({
      ...score,
      name: this.sanitizeInput(score.name)
    }));
  }

  /**
   * Saves a new high score to local storage
   * @param {string} name - Player name
   * @param {number} score - Score value
   */
  saveHighScore(name, score) {
    const highScores = this.getHighScores();

    // Sanitize the name to prevent XSS
    const sanitizedName = this.sanitizeInput(name);

    const newScore = {
      name: sanitizedName,
      score: score,
      date: new Date().toISOString()
    };
    highScores.push(newScore);

    // Sort by score descending
    highScores.sort((a, b) => b.score - a.score);

    localStorage.setItem(this.storageKey, JSON.stringify(highScores));
  }

  /**
   * Finds the most recent score from an array of scores
   * @param {Array} scores - Array of score objects with date property
   * @returns {Object|null} Most recent score object or null if empty
   */
  findMostRecentScore(scores) {
    if (scores.length === 0) return null;

    return scores.reduce((mostRecent, score) => {
      const scoreDate = new Date(score.date);
      const mostRecentDate = mostRecent ? new Date(mostRecent.date) : null;
      return (!mostRecentDate || scoreDate > mostRecentDate) ? score : mostRecent;
    }, null);
  }

  /**
   * Creates a score entry for display in the menu
   * @param {Object} score - Score object
   * @param {number} rank - Display rank (1-based)
   * @param {Object|null} mostRecentScore - The most recent score for comparison
   * @returns {Object} Formatted score entry
   */
  createScoreEntry(score, rank, mostRecentScore) {
    return {
      ...score,
      rank: rank,
      isEllipsis: false,
      isRecent: score === mostRecentScore
    };
  }

  /**
   * Prepares the display scores list based on recent score rank
   * @param {Array} allScores - All scores sorted by rank
   * @param {Object|null} mostRecentScore - The most recent score
   * @returns {Array} Array of scores to display (max 10 entries)
   */
  prepareDisplayScores(allScores, mostRecentScore) {
    const recentIndex = mostRecentScore ? allScores.indexOf(mostRecentScore) : -1;
    const recentRank = recentIndex >= 0 ? recentIndex + 1 : -1;

    // Recent score is in top 10 or doesn't exist, show top 10 normally
    if (recentRank === -1 || recentRank <= 10) {
      return allScores.slice(0, 10).map((score, index) =>
        this.createScoreEntry(score, index + 1, mostRecentScore)
      );
    }

    // Recent score is outside top 10: show top 8, ellipsis, then recent score
    const displayScores = allScores.slice(0, 8).map((score, index) =>
      this.createScoreEntry(score, index + 1, mostRecentScore)
    );

    // Add ellipsis at position 9
    displayScores.push({ isEllipsis: true, rank: 9 });

    // Add recent score at position 10 with its actual rank
    displayScores.push(this.createScoreEntry(allScores[recentIndex], recentRank, mostRecentScore));

    return displayScores;
  }

  /**
   * Displays the high scores menu
   * Shows top 10 scores, or top 8 + most recent if recent is outside top 10
   */
  showHighScoresMenu() {
    // Remove pause class (show background image)
    document.getElementById('menuOverlay').classList.remove('pause');

    const allScores = this.getHighScores();
    const mostRecentScore = this.findMostRecentScore(allScores);
    const displayScores = this.prepareDisplayScores(allScores, mostRecentScore);

    this.menuSystem.showMenu(MenuSystem.MenuTypes.HIGH_SCORES, {
      title: 'HIGH SCORES',
      items: [
        {
          type: 'scoreList',
          scores: displayScores
        },
        {
          type: 'button',
          label: 'Main Menu',
          action: () => this.showMainMenuCallback()
        }
      ]
    });
  }
}

export { HighScoreManager };
