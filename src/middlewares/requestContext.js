import { randomUUID } from 'node:crypto'
import httpContext from 'express-http-context'

/**
 * Middleware that assigns a unique request ID and stores the request in the HTTP context.
 *
 * @param req
 * @param res
 * @param next
 */
export const requestContext = (req, res, next) => {
  const uuid = randomUUID()
  req.requestUuid = uuid

  httpContext.set('requestId', uuid)
  httpContext.set('request', req)

  next()
}
