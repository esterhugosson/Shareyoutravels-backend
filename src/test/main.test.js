import request from 'supertest'
import { app } from '../app.js'

describe('GET /', () => {
  it('should return 404 or expected response', async () => {
    const res = await request(app).get('/')
    expect(res.statusCode).toBe(404)
  })
})

describe('GET /api/v1', () => {
  it('should return 404 or expected response', async () => {
    const res = await request(app).get('/api/v1')
    expect(res.statusCode).toBe(200)
  })
})
