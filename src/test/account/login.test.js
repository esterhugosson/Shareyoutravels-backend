import request from 'supertest'
import { app } from '../../app.js'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'


let mongoServer

/**
 * Random string function.
 *
 * @param {number} length The length of the string.
 * @returns {string} a random string
 */
function randomString (length = 6) {
  return Math.random().toString(36).substring(2, 2 + length)
}

describe('Account Sign in', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  }, 15000)

  it('should login a user successfully', async () => {
    const uniqueSuffix = randomString()
    await request(app).post('/api/v1/auth/register').send({
      firstName: 'Ester',
      lastName: 'Hugosson',
      username: `ester${uniqueSuffix}`,
      email: `ester${uniqueSuffix}@example.com`,
      password: 'secret12345'
    })

    const res = await request(app).post('/api/v1/auth/signin').send({

      username: `ester${uniqueSuffix}`,
      password: 'secret12345'

    })

    expect(res.statusCode).toBe(200)
  })

  it('should not login a user successfully with non registreted username and password', async () => {
    const uniqueSuffix = randomString()

    const res = await request(app).post('/api/v1/auth/signin').send({

      username: `ester${uniqueSuffix}`,
      password: 'secret12345'

    })

    expect(res.statusCode).toBe(401)
  })
})
