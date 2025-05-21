import request from 'supertest'
import { app } from '../app.js'

describe('GET /backend-project/', () => {
  it('should return 404 or expected response', async () => {
    const res = await request(app).get('/backend-project/')
    expect(res.statusCode).toBe(404)
  })
})

describe('GET /backend-project/api/v1', () => {
  it('should return 404 or expected response', async () => {
    const res = await request(app).get('/backend-project/api/v1')
    expect(res.statusCode).toBe(200)
  })
})
