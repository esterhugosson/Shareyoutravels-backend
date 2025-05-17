import { logger } from '../config/winston.js'

/**
 * Wraps an asynchronous controller function in a try/catch block
 * to handle errors and pass them to Express' error-handling middleware.
 *
 * @param {Function} controller - The asynchronous controller function to wrap.
 * @returns {Function} A new function that wraps the controller in error handling logic.
 */
export function tryCatch (controller) {
  return async (req, res, next) => {
    try {
      await controller(req, res, next)
    } catch (error) {
      logger.error('Error', error)
      next(error)
    }
  }
}
