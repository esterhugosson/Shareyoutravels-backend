/**
 * @file Defines the place router.
 * @module routes/placeRouter
 * @version 1.0.0
 */

import express from 'express'
import { PlaceController } from '../../../controllers/api/PlaceController.js'
import { tryCatch } from '../../../utils/tryCatch.js'
import { authenticateJWT } from '../../../middlewares/auth.js'

export const router = express.Router({ mergeParams: true })

const controller = new PlaceController()

// Get all places for a travel not protected, but only public should be shown
router.get('/', tryCatch(controller.allPlacesFromTravel.bind(controller)))

// All routes are protected
router.use(authenticateJWT)

// Get one place from a travel
router.get('/:placeId', tryCatch(controller.onePlaceFromTravel.bind(controller)))

// Add a place to a travel
router.post('/', tryCatch(controller.addPlaceToTravel.bind(controller)))

// Update a place from a travel
router.patch('/:placeId', tryCatch(controller.updatePlace.bind(controller)))

// Delete a place from a travel
router.delete('/:placeId', tryCatch(controller.deletePlace.bind(controller)))
