import request from 'supertest'
import { app } from '../../app.js'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { UserModel } from '../../models/UserModel.js'
import { JsonWebToken } from '../../lib/JsonWebToken.js'
import { TravelModel } from '../../models/TravelModel.js'
import { PlaceModel } from '../../models/PlaceModel.js'
import dotenv from 'dotenv'
dotenv.config()

let mongoServer
let token
let userId
let travel
let place

describe('Place CRUD application', () => {
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

    // ---Creating jwt token---

    token = await JsonWebToken.encodeUser(
      user,
      process.env.ACCESS_TOKEN_SECRET || 'your_jwt_secret',
      '1h'
    )

    // ---Create travel===//
    travel = await TravelModel.create({
      destination: 'France',
      transport: 'train',
      startDate: '2025-06-01',
      endDate: '2025-06-15',
      location: {
        lat: 41.9028,
        lng: 12.4964
      },
      userId
    })

    // ---Create Place---//
    place = await PlaceModel.create({
      travelId: travel._id,
      name: 'Paris',
      description: ' 2 nights in paris',
      location: {
        lat: 41.9028,
        lng: 12.4964
      },
      dateVisited: '2025-06-01'
    })

    travel.places.push(place._id)

    await travel.save()
  }, 15000)

  // ---Disconnect to database and delete---//
  afterAll(async () => {
    await UserModel.deleteMany()
    await TravelModel.deleteMany()
    await PlaceModel.deleteMany()
    await mongoose.disconnect()
    await mongoServer.stop()
  }, 15000) // timeout 15 sec

  // ---READ--- //
  describe('GET /travels/:id/places', () => {
    it('GET /travels/:id/places', async () => {
      const res = await request(app)
        .get(`/backend-project/api/v1/travels/${travel._id}/places`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.statusCode).toBe(200)
      expect(res.body).toEqual(expect.arrayContaining([
        expect.objectContaining({ name: 'Paris' })
      ]))
    }, 15000)

    it('should return 404 for non-existent travel', async () => {
      const fakeId = new mongoose.Types.ObjectId()
      const res = await request(app)
        .get(`/backend-project/api/v1/travels/${fakeId}/places`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.statusCode).toBe(404)
    })
  })

  describe('GET /travels/:id/places/:placeId', () => {
    it('should get a specific place from a travel', async () => {
      const res = await request(app)
        .get(`/backend-project/api/v1/travels/${travel._id}/places/${place._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.statusCode).toBe(200)
      expect(res.body.name).toBe('Paris')
    })
  })

  describe('POST /travels/:id/places', () => {
    it('should add a place to the travel', async () => {
      const newPlace = {
        name: 'Rome',
        location: {
          lat: 41.9028,
          lng: 12.4964
        },
        description: 'Colosseum and pasta',
        date: new Date(),
        funFacts: 'Romans built a huge empire',
        rating: 4
      }

      const res = await request(app)
        .post(`/backend-project/api/v1/travels/${travel._id}/places`)
        .set('Authorization', `Bearer ${token}`)
        .send(newPlace)

      expect(res.statusCode).toBe(201)
      expect(res.body.name).toBe('Rome')
    })
  })

  describe('PATCH /travels/:id/places/:placeId', () => {
    it('should update a place', async () => {
      const res = await request(app)
        .patch(`/backend-project/api/v1/travels/${travel._id}/places/${place._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Paris Updated' })

      expect(res.statusCode).toBe(200)
      expect(res.body.name).toBe('Paris Updated')
    })
  })

  describe('DELETE /travels/:id/places/:placeId', () => {
    it('should delete a place', async () => {
      const placeToDelete = await PlaceModel.create({
        travelId: travel._id,
        name: 'Berlin',
        location: {
          lat: 41.9028,
          lng: 12.4964
        },
        dateVisited: new Date()
      })

      travel.places.push(placeToDelete._id)
      await travel.save()

      const res = await request(app)
        .delete(`/backend-project/api/v1/travels/${travel._id}/places/${placeToDelete._id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.statusCode).toBe(204)
    })
  })

  describe('GET /travels/public-places', () => {
    it('should return all places from public travels', async () => {
      travel.isPublic = true
      await travel.save()

      const res = await request(app).get('/backend-project/api/v1/travels/places/public-places')

      expect(res.statusCode).toBe(200)
      expect(res.body.length).toBeGreaterThan(0)
    })
  })
})
