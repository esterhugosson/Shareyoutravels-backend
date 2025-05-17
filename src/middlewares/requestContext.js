import { randomUUID } from 'node:crypto'
import httpContext from 'express-http-context'

/**
 * Middleware that assigns a unique request ID and stores the request in the HTTP context.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const requestContext = (req, res, next) => {
  const uuid = randomUUID()
  req.requestUuid = uuid

  httpContext.set('requestId', uuid)
  httpContext.set('request', req)

  next()
}
