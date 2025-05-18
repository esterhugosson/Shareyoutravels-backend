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

describe('Account Registration', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  }, 15000) // timeout 15 sec

  it('should register a user successfully', async () => {
    const uniqueSuffix = randomString()
    const res = await request(app).post('/api/v1/auth/register').send({
      firstName: 'Ester',
      lastName: 'Hugosson',
      username: `ester${uniqueSuffix}`,
      email: `ester${uniqueSuffix}@example.com`,
      password: 'secret12345'
    })

    expect(res.statusCode).toBe(201)
  })

  it('should not register if username already exists', async () => {
    // First register user
    const uniqueSuffix = randomString()
    await request(app).post('/api/v1/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      username: `user${uniqueSuffix}`,
      email: `user${uniqueSuffix}@example.com`,
      password: 'securePassword123'
    })

    // Try registering again with same email to get conflict
    const res = await request(app).post('/api/v1/auth/register').send({
      firstName: 'Ester',
      lastName: 'Hugosson',
      username: `user${uniqueSuffix}`, // same username
      email: `user${randomString()}@example.com`, // different email as above
      password: 'secret12345'
    })

    expect(res.statusCode).toBe(409)
    expect(res.body.message).toMatch(/Conflict/i)
  })
})
