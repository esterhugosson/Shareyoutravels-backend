/**
 * @file Defines the main application.
 * @module src/server
 * @author Ester Hugosson
 * @version 1.0.0
 */

import httpContext from 'express-http-context'
import express from 'express' 
import '@lnu/json-js-cycle'
import cors from 'cors'
import helmet from 'helmet'
import { connectToDatabase } from './config/mongoose.js'
import { requestContext } from './middlewares/requestContext.js'
import { morganLogger } from './config/morgan.js'
import { logger } from './config/winston.js'
import { router } from './routes/router.js'
import { errorHandler } from './middlewares/errorHandler.js'


try {
  // Connect to MongoDB.
  await connectToDatabase(process.env.DB_CONNECTION_STRING)

  // Create an Express application.
  const app = express()

  // Set various HTTP headers to make the application little more secure (https://www.npmjs.com/package/helmet).
  app.use(helmet())

  // Enable Cross Origin Resource Sharing (CORS) (https://www.npmjs.com/package/cors).
  app.use(cors())

  // Parse requests of the content type application/json.
  app.use(express.json())

  // Add the request-scoped context.
  app.use(httpContext.middleware)

// Middleware to be executed before the routes.
  app.use(requestContext) 

  // Use a morgan logger.
  app.use(morganLogger)

  // Register routes.
  app.use('/', router)

  // Error handler.
  app.use(errorHandler)

  // Starts the HTTP server listening for connections.
  const server = app.listen(process.env.PORT, () => {
    logger.info(`Server running at http://localhost:${server.address().port}`)
    logger.info('Press Ctrl-C to terminate...')
  })
} catch (err) {
  logger.error(err.message, { error: err })
  process.exitCode = 1
}
