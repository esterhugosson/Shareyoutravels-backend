import request from 'supertest'
import { app } from '../../app.js'
import { connectToDatabase, disconnectFromDatabase } from '../../config/mongoose.js'
import dotenv from 'dotenv'
dotenv.config()

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
    await connectToDatabase(process.env.DB_CONNECTION_STRING)
  })

  afterAll(async () => {
    await disconnectFromDatabase()
  })

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

  it('should not register if email already exists', async () => {
    // First register user
    const uniqueSuffix = randomString()
    const firstRes = await request(app).post('/api/v1/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      username: `user${uniqueSuffix}`,
      email: `user${uniqueSuffix}@example.com`,
      password: 'securePassword123'
    })
    console.log('First register status:', firstRes.statusCode)
    console.log('First register body:', firstRes.body)

    // Try registering again with same email to get conflict
    const res = await request(app).post('/api/v1/auth/register').send({
      firstName: 'Ester',
      lastName: 'Hugosson',
      username: `ester${randomString()}`, // different username
      email: `user${uniqueSuffix}@example.com`, // same email as above
      password: 'secret12345'
    })

    console.log(uniqueSuffix)

    expect(res.statusCode).toBe(409)
    expect(res.body.message).toMatch(/Conflict/i)
  })
})
