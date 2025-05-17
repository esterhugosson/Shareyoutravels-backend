import { STATUS_CODES } from 'http'
import { logger } from '../config/winston.js'
import '@lnu/json-js-cycle'
import dotenv from 'dotenv'
dotenv.config()

/**
 * Express error-handling middleware.
 * Logs the error and sends a structured response to the client.
 * In production, it hides internal error details.
 * In development, it includes full error information.
 *
 * @param {Error} err - The error object caught in the middleware chain.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { error: err })

  if (process.env.NODE_ENV === 'production') {
    // Ensure a valid status code is set for the error otherwise default 500
    if (!err.status) {
      err.status = 500
      err.message = STATUS_CODES[err.status]
    }

    // Send only the error message and status code
    return res.status(err.status).json({
      status: err.status,
      message: err.message
    })
  }
  // In development: include full error details, even non-enumerable properties
  const copy = JSON.decycle(err, { includeNonEnumerableProperties: true })

  return res
    .status(err.status || 500)
    .json(copy)
}
