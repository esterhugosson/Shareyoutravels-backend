/**
 * @file Defines the PlaceController class.
 * @module controllers/PlaceController
 * @author Ester Hugosson
 * @version 1.0.0
 */

import { PlaceModel } from '../../models/PlaceModel.js'
import { TravelController } from './TravelController.js'
import createError from 'http-errors'

/**
 * Encapsulates a controller.
 */
export class PlaceController {
  /**
   * Constructs a new instance with a travelController.
   */
  constructor () {
    this.travelController = new TravelController()
  }

  /**
   * Get all places from specifik travel.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async allPlacesFromTravel (req, res) {
    const { id } = req.params
    const travel = await this.travelController.findTravelByIdWithOwnershipCheck(id, req.user.id)
    if (!travel) throw createError(404, 'Travel not found')

    await this.#validateOwnership(travel, req.user.id)

    const populatedTravel = await travel.populate('places')
    res.status(200).json(populatedTravel.places)
  }

  /**
   * Get one place from specifik travel.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async onePlaceFromTravel (req, res) {
    const { id, placeId } = req.params
    const travel = await this.travelController.findTravelByIdWithOwnershipCheck(id, req.user.id)
    if (!travel) throw createError(404, 'Travel not found')

    const place = await PlaceModel.findById(placeId)
    if (!place) throw createError(404, 'Place not found')

    res.status(200).json(place)
  }

  /**
   * Create new place.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async addPlaceToTravel (req, res) {
    const { id } = req.params
    const userId = req.user.id

    // 1. Fetch travel
    const travel = await this.travelController.findTravelByIdWithOwnershipCheck(id, userId)
    if (!travel) throw createError(404, 'Travel not found')

    // 2. Ownership check
    await this.#validateOwnership(travel, userId)

    // 3. Create place
    const place = new PlaceModel({
      travelId: travel.id,
      name: req.body.name,
      description: req.body.description || '',
      location: req.body.location || '',
      dateVisited: req.body.date,
      funFacts: req.body.funFacts,
      rating: req.body.rating
    })

    await place.save()

    // 4. Link place to travel
    travel.places.push(place._id)
    await travel.save()

    res.status(201).json(place)
  }

  /**
   * Update a place.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async updatePlace (req, res) {
    const { id, placeId } = req.params
    const travel = await this.travelController.findTravelByIdWithOwnershipCheck(id, req.user.id)
    if (!travel) throw createError(404, 'Travel not found')

    await this.#validateOwnership(travel, req.user.id)

    const place = await PlaceModel.findByIdAndUpdate(
      placeId,
      req.body,
      { new: true, runValidators: true }
    )
    if (!place) throw createError(404, 'Place not found')

    res.status(200).json(place)
  }

  /**
   * Delete a place.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async deletePlace (req, res) {
    const { id, placeId } = req.params
    const travel = await this.travelController.findTravelByIdWithOwnershipCheck(id, req.user.id)
    if (!travel) throw createError(404, 'Travel not found')

    await this.#validateOwnership(travel, req.user.id)

    // Remove place from travel
    travel.places.pull(placeId)
    await travel.save()

    // Delete place document
    await PlaceModel.findByIdAndDelete(placeId)

    res.sendStatus(204)
  }

  /**
   * Get all places from all public travels.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async allPlacesFromPublicTravels (req, res) {
    const publicTravels = await this.travelController.findAllPublicTravelsWithPlaces()

    if (!publicTravels.length) {
      throw createError(404, 'No public travels found.')
    }

    const allPlaces = publicTravels.flatMap(travel => travel.places)
    res.status(200).json(allPlaces)
  }

  /**
   * Validates the ownership.
   *
   * @param {object} travel The travel doc.
   * @param {string} userId The user id.
   */
  async #validateOwnership (travel, userId) {
    if (!travel.userId.equals(userId)) {
      throw createError(403, 'You are not authorized to modify this image.')
    }
  }
}
