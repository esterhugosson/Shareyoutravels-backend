/**
 * @file Defines the travel router.
 * @module routes/travelRouter
 * @author Ester Hugosson
 * @version 1.0.0
 */

import express from 'express'
import { TravelController } from '../../../controllers/api/TravelController.js'
import { tryCatch } from '../../../utils/tryCatch.js'
import { authenticateJWT } from '../../../middlewares/auth.js'
import { router as placeRouter } from './placeRouter.js'

export const router = express.Router()

const controller = new TravelController()

// Provide req.doc to the route if :id is present in the route path.
router.param('id', (req, res, next, id) => controller.loadTravelDoc(req, res, next, id))

// Read all public travels
router.get('/allTravels', tryCatch(controller.allPublicTravels.bind(controller)))

// Read all users travels PROTECTED
router.get('/', authenticateJWT, tryCatch(controller.myTravels.bind(controller)))

// Read travel by PROTECTED
router.get('/:id', authenticateJWT, tryCatch(controller.myTravelsbyId.bind(controller)))

// Create a new travel PROTECTED
router.post('/', authenticateJWT, tryCatch(controller.createTravel.bind(controller)))

// Update a travel PROTECTED
router.patch('/:id', authenticateJWT, tryCatch(controller.updateTravel.bind(controller)))

// Delete a travel PROTECTED
router.delete('/:id', authenticateJWT, tryCatch(controller.deleteTravel.bind(controller)))

// Places should use the place router
router.use('/:id/places', placeRouter)
