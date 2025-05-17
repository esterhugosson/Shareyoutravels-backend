// src/server.js
import { app } from './app.js'
import { logger } from './config/winston.js'
import { connectToDatabase } from './config/mongoose.js'

try {
  await connectToDatabase(process.env.DB_CONNECTION_STRING)

  const server = app.listen(process.env.PORT || 3000, () => {
    logger.info(`Server running at http://localhost:${server.address().port}`)
    logger.info('Press Ctrl-C to terminate...')
  })
} catch (err) {
  logger.error(err.message, { error: err })
  process.exitCode = 1
}
