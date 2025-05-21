import request from 'supertest'
import { app } from '../../app.js'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { UserModel } from '../../models/UserModel.js'
import { JsonWebToken } from '../../lib/JsonWebToken.js'
// import { TravelModel } from '../../models/TravelModel.js'
import dotenv from 'dotenv'
dotenv.config()

let mongoServer
let token
let userId

describe('Travel CRUD application', () => {
  // ---Connect to database---//
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)

    // ---Create a user---
    const user = await UserModel.create({
      firstName: 'Ester',
      lastName: 'Hugosson',
      username: 'ester123',
      email: 'ester@example.com',
      password: 'secret12345'
    })

    userId = user._id
    console.log(userId)

    // ---Creating jwt token---

    token = await JsonWebToken.encodeUser(
      user,
      process.env.ACCESS_TOKEN_SECRET || 'your_jwt_secret',
      '1h'
    )
  }, 15000)

  // ---Disconnect to database---//
  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  }, 15000) // timeout 15 sec

  // ---CREATE--- //
  it('should create a travel for authenticated user', async () => {
    const res = await request(app)
      .post('/backend-project/api/v1/travels') // adjust path if needed
      .set('Authorization', `Bearer ${token}`)
      .send({
        destination: 'Rome',
        transport: 'flight', // Make sure this matches the enum: lowercase
        notes: 'Test travel',
        places: [],
        isPublic: true,
        startDate: '2025-06-01',
        endDate: '2025-06-15',
        location: {
          lat: 41.9028, // Rome's latitude
          lng: 12.4964 // Rome's longitude
        }

      })

    expect(res.statusCode).toBe(201)
    expect(res.body.travel.destination).toBe('Rome')
  }, 15000)

  // ---CREATE--- //
  it('should NOT create a travel for unauthenticated user', async () => {
    const res = await request(app)
      .post('/backend-project/api/v1/travels')
      .send({
        destination: 'Rome',
        transport: 'flight', // Make sure this matches the enum: lowercase
        notes: 'Test travel',
        places: [],
        isPublic: true,
        startDate: '2025-06-01',
        endDate: '2025-06-15',
        location: {
          lat: 41.9028, // Rome's latitude
          lng: 12.4964 // Rome's longitude
        }

      })

    expect(res.statusCode).toBe(401)
  }, 15000)

  // ---CREATE--- //
  it('should NOT create a travel with missing parameters', async () => {
    const res = await request(app)
      .post('/backend-project/api/v1/travels')
      .set('Authorization', `Bearer ${token}`)
      .send({
        destination: 'Rome',
        notes: 'Test travel',
        places: [],
        isPublic: true,
        startDate: '2025-06-01',
        endDate: '2025-06-15',
        location: {
          lat: 41.9028, // Rome's latitude
          lng: 12.4964 // Rome's longitude
        }

      })

    expect(res.statusCode).toBe(400)
  }, 15000)

  // ---READ--- //
  it('Should get my own travels', async () => {
    const res = await request(app)
      .get('/backend-project/api/v1/travels')
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
  }, 15000)

  // ---READ--- //
  it('Should get all public travels', async () => {
    const res = await request(app)
      .get('/backend-project/api/v1/travels/allTravels')
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
  }, 15000)

  let travelId

  // ---CREATE & store travelId for later--- //
  it('should create a travel and store the id', async () => {
    const res = await request(app)
      .post('/backend-project/api/v1/travels')
      .set('Authorization', `Bearer ${token}`)
      .send({
        destination: 'Berlin',
        transport: 'train',
        notes: 'Conference trip',
        places: [],
        isPublic: false,
        startDate: '2025-07-10',
        endDate: '2025-07-15',
        location: {
          lat: 52.52,
          lng: 13.405
        }
      })

    expect(res.statusCode).toBe(201)
    expect(res.body.travel.destination).toBe('Berlin')
    travelId = res.body.travel.id // Save for later tests
    console.log('BODY IS' + res.body)

    console.log('TRAVELID IS ' + travelId)
  }, 15000)

  // ---READ one by ID (owned)--- //
  it('should get my travel by id', async () => {
    const res = await request(app)
      .get(`/backend-project/api/v1/travels/${travelId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.destination).toBe('Berlin')
  }, 15000)

  // ---UPDATE--- //
  it('should update my travel', async () => {
    const res = await request(app)
      .patch(`/backend-project/api/v1/travels/${travelId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        notes: 'Updated: attending JSConf',
        isPublic: true
      })

    expect(res.statusCode).toBe(200)
    expect(res.body.travel.notes).toBe('Updated: attending JSConf')
    expect(res.body.travel.isPublic).toBe(true)
  }, 15000)

  // ---DELETE--- //
  it('should delete my travel', async () => {
    const res = await request(app)
      .delete(`/backend-project/api/v1/travels/${travelId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(204)

    // Check if it's really gone
    const getRes = await request(app)
      .get(`/backend-project/api/v1/travels/${travelId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(getRes.statusCode).toBe(404)
  }, 15000)
})
