/**
 * Simple logging utility with timestamps and levels
 */

const colors = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
};

class Logger {
  static timestamp() {
    return new Date().toISOString();
  }

  static info(message) {
    console.log(`${colors.blue}[INFO] [${this.timestamp()}]${colors.reset} ${message}`);
  }

  static success(message) {
    console.log(`${colors.green}[SUCCESS] [${this.timestamp()}]${colors.reset} ${message}`);
  }

  static warn(message) {
    console.warn(`${colors.yellow}[WARN] [${this.timestamp()}]${colors.reset} ${message}`);
  }

  static error(message) {
    console.error(`${colors.red}[ERROR] [${this.timestamp()}]${colors.reset} ${message}`);
  }

  static debug(message) {
    console.log(`${colors.magenta}[DEBUG] [${this.timestamp()}]${colors.reset} ${message}`);
  }
}

module.exports = Logger;
