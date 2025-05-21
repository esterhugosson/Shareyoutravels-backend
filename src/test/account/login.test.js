import request from 'supertest'
import { app } from '../../app.js'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongoServer
let accessToken
let refreshToken

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
    const username = `ester${uniqueSuffix}`
    const email = `ester${uniqueSuffix}@example.com`

    const registerRes = await request(app).post('/backend-project/api/v1/auth/register').send({
      firstName: 'Ester',
      lastName: 'Hugosson',
      username,
      email,
      password: 'secret12345'
    })

    expect(registerRes.statusCode).toBe(201)

    const res = await request(app).post('/backend-project/api/v1/auth/signin').send({
      username,
      password: 'secret12345'
    })

    expect(res.statusCode).toBe(200)
    accessToken = res.body.access_token
    refreshToken = res.body.refresh_token

    expect(accessToken).toBeDefined()
    expect(refreshToken).toBeDefined()
  })

  it('should not login a user successfully with non registreted username and password', async () => {
    const uniqueSuffix = randomString()

    const res = await request(app).post('/backend-project/api/v1/auth/signin').send({

      username: `ester${uniqueSuffix}`,
      password: 'secret12345'

    })

    expect(res.statusCode).toBe(401)
  })

  it('should refresh the access token with a valid refresh token', async () => {
    const res = await request(app).post('/backend-project/api/v1/auth/refresh').send({
      refreshToken
    })

    expect(res.statusCode).toBe(200)
    expect(res.body.access_token).toBeDefined()
    expect(res.body.refresh_token).toBeDefined()
  })

  it('should update account information successfully', async () => {
    const newFirst = `firstname${randomString()}`

    const res = await request(app)
      .patch('/backend-project/api/v1/auth/update')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        firstName: newFirst
      })

    expect(res.statusCode).toBe(200)
    expect(res.body.user.firstName).toBe(newFirst)
  })

  it('should not update account information without a valid token', async () => {
    const newUsername = `newUsername${randomString()}`

    const res = await request(app)
      .patch('/backend-project/api/v1/auth/update')
      .send({
        username: newUsername
      })

    expect(res.statusCode).toBe(401) // Unauthorized
  })

  it('should delete the user account successfully', async () => {
    const res = await request(app)
      .delete('/backend-project/api/v1/auth/delete')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe('Account deleted successfully')
  })

  it('should not delete account without a valid token', async () => {
    const res = await request(app)
      .delete('/backend-project/api/v1/auth/delete')

    expect(res.statusCode).toBe(401) // Unauthorized
  })
})
