// src/app.js
import httpContext from 'express-http-context'
import express from 'express'
import '@lnu/json-js-cycle'
import cors from 'cors'
import helmet from 'helmet'
import { requestContext } from './middlewares/requestContext.js'
import { morganLogger } from './config/morgan.js'
import { router } from './routes/router.js'
import { errorHandler } from './middlewares/errorHandler.js'
import dotenv from 'dotenv'
dotenv.config()

const baseURL = process.env.BASE_URL || '/'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(httpContext.middleware)
app.use(requestContext)
app.use(morganLogger)
app.use(baseURL, router)
app.use(errorHandler)

export { app }
