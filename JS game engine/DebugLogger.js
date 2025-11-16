/**
 * DebugLogger - Centralized debug logging system
 *
 * Responsibilities:
 * - Conditional logging based on debug flag
 * - Consistent logging interface across the project
 * - Easy to enable/disable debug output
 */
class DebugLogger {
  /**
   * Debug mode flag - set to false to disable all debug logs
   */
  static debug = false;

  /**
   * Logs a debug message (only if debug mode is enabled)
   * @param {...any} args - Arguments to log (same as console.log)
   */
  static log(...args) {
    if (DebugLogger.debug) {
      console.log(...args);
    }
  }

  /**
   * Logs a warning message (always shown, regardless of debug mode)
   * @param {...any} args - Arguments to log
   */
  static warn(...args) {
    console.warn(...args);
  }

  /**
   * Logs an error message (always shown, regardless of debug mode)
   * @param {...any} args - Arguments to log
   */
  static error(...args) {
    console.error(...args);
  }

  /**
   * Logs an info message (only if debug mode is enabled)
   * @param {...any} args - Arguments to log
   */
  static info(...args) {
    if (DebugLogger.debug) {
      console.info(...args);
    }
  }
}
