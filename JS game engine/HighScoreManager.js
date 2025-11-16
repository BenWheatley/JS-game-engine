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
  constructor(menuSystem) {
    this.menuSystem = menuSystem;
    this.storageKey = 'highScores';
    this.maxScores = 100;
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

    // Keep only top scores to prevent unlimited growth
    const topScores = highScores.slice(0, this.maxScores);
    localStorage.setItem(this.storageKey, JSON.stringify(topScores));
  }

  /**
   * Displays the high scores menu
   * Shows top 10 scores, or top 8 + most recent if recent is outside top 10
   */
  showHighScoresMenu() {
    // Remove pause class (show background image)
    document.getElementById('menuOverlay').classList.remove('pause');

    const allScores = this.getHighScores();

    // Find the most recent score by date
    let mostRecentScore = null;
    let mostRecentDate = null;

    allScores.forEach(score => {
      const scoreDate = new Date(score.date);
      if (!mostRecentDate || scoreDate > mostRecentDate) {
        mostRecentDate = scoreDate;
        mostRecentScore = score;
      }
    });

    // Find the rank of the most recent score
    const recentIndex = mostRecentScore ? allScores.indexOf(mostRecentScore) : -1;
    const recentRank = recentIndex >= 0 ? recentIndex + 1 : -1;

    let displayScores = [];

    if (recentRank === -1 || recentRank <= 10) {
      // Recent score is in top 10 or doesn't exist, show top 10 normally
      displayScores = allScores.slice(0, 10).map((score, index) => ({
        ...score,
        rank: index + 1,
        isEllipsis: false,
        isRecent: score === mostRecentScore
      }));
    } else {
      // Recent score is outside top 10
      // Show positions 1-8
      displayScores = allScores.slice(0, 8).map((score, index) => ({
        ...score,
        rank: index + 1,
        isEllipsis: false,
        isRecent: score === mostRecentScore
      }));

      // Add ellipsis at position 9
      displayScores.push({
        isEllipsis: true,
        rank: 9
      });

      // Add recent score at position 10 with its actual rank
      displayScores.push({
        ...allScores[recentIndex],
        rank: recentRank,
        isEllipsis: false,
        isRecent: true
      });
    }

    this.menuSystem.showMenu({
      title: 'HIGH SCORES',
      items: [
        {
          type: 'scoreList',
          scores: displayScores
        },
        {
          type: 'button',
          label: 'Main Menu',
          action: () => {
            if (typeof showMainMenu === 'function') {
              showMainMenu();
            }
          }
        }
      ]
    });
  }
}
