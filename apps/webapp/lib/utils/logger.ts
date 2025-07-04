/**
 * Development-only logging utility
 * Logs are only output in development environment
 */
export function logDev(...args: any[]) {
    if (process.env.NODE_ENV === "development") {
      console.log(...args)
    }
  }
  
  /**
   * Development-only error logging
   */
  export function logError(...args: any[]) {
    if (process.env.NODE_ENV === "development") {
      console.error(...args)
    }
  }
  
  /**
   * Development-only warning logging
   */
  export function logWarn(...args: any[]) {
    if (process.env.NODE_ENV === "development") {
      console.warn(...args)
    }
  }
  
  /**
   * Development-only info logging
   */
  export function logInfo(...args: any[]) {
    if (process.env.NODE_ENV === "development") {
      console.info(...args)
    }
  }
  
  /**
   * Production-safe logging for critical errors that should always be logged
   */
  export function logCritical(...args: any[]) {
    console.error("[CRITICAL]", ...args)
    // TODO: Send to error reporting service
  }
  