/**
 * @file Defines the TravelController class.
 * @module controllers/TravelController
 * @author Ester Hugosson
 * @version 1.0.0
 */

import { TravelModel } from '../../models/TravelModel.js'
import { logger } from '../../config/winston.js'
import createError from 'http-errors'
import { validateAllowedFields, validateRequiredFields } from '../../utils/validateFields.js'

/**
 * Encapsulates a controller.
 */
export class TravelController {
  /**
   * Load the travel document in the req.doc if id is available in path.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The travel document ID from the route parameter.
   * @returns {void}
   */
  async loadTravelDoc (req, res, next, id) {
    try {
      const travelDoc = await TravelModel.findOne({ _id: id })

      // No travel with that id
      if (!travelDoc) {
        logger.warn('No travel found for the given id.')
        return res.status(404).json({ message: 'Travel for this id not found.' })
      }

      req.doc = travelDoc
      next()
    } catch (error) {
      logger.error('Could not get travel', error)
      next(error)
    }
  }

  /**
   * Get all public travel where isPublic - true.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async allPublicTravels (req, res) {
    const travels = await TravelModel.find({ isPublic: true })

    if (!travels.length) {
      throw createError(404, 'No travels found.')
    }

    const results = travels.map(doc => doc.toObject())
    res.status(200).json(results)
  }

  /**
   * Get all travels from the current user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async myTravels (req, res) {
    const userId = req.user.id

    const travels = await TravelModel.find({ userId })

    if (!travels.length) {
      throw createError(404, 'No travels found.')
    }

    const results = travels.map(doc => doc.toObject())
    res.status(200).json(results)
  }

  /**
   * Get one travel by id.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async myTravelsbyId (req, res) {
    // check ownership
    this.#validateOwnership(req.doc, req.user.id)

    const travel = req.doc

    res.status(200)
      .json(travel)
  }

  /**
   * Create a new travel.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async createTravel (req, res) {
    console.log(req.user)

    const {
      destination,
      transport,
      notes,
      places,
      isPublic,
      startDate,
      endDate,
      location
    } = req.body

    // Validation
    const allowedFields = ['destination', 'transport', 'notes', 'places', 'isPublic', 'startDate', 'endDate', 'location']
    const requiredFields = ['destination', 'transport', 'startDate', 'endDate', 'location']

    validateAllowedFields(req.body, allowedFields)
    validateRequiredFields(req.body, requiredFields)

    // Set user id
    const userId = req.user.id

    // Create Travel
    const travel = await TravelModel.create({
      destination,
      transport,
      notes,
      places,
      isPublic,
      startDate,
      endDate,
      location,
      userId
    })

    // Send status back
    res.status(201).json({
      message: 'Travel created successfully.',
      travel
    })
  }

  /**
   * Update an existing travel.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async updateTravel (req, res) {
    const travel = req.doc

    // Validate ownership
    this.#validateOwnership(travel, req.user.id)

    // Validation
    const allowedFields = ['destination', 'transport', 'notes', 'isPublic', 'startDate', 'endDate', 'location']
    validateAllowedFields(req.body, allowedFields)

    const body = req.body

    if ('destination' in body) travel.destination = body.destination
    if ('transport' in body) travel.transport = body.transport
    if ('notes' in body) travel.notes = body.notes
    if ('isPublic' in body) travel.isPublic = body.isPublic
    if ('startDate' in body) travel.startDate = body.startDate
    if ('endDate' in body) travel.endDate = body.endDate
    if ('location' in body && typeof body.location === 'object') {
      travel.location = {
        ...travel.location?.toObject?.(),
        ...body.location
      }
    }

    await travel.save()

    res.status(200).json({ message: 'Travel updated successfully', travel })
  }

  /**
   * Delete a travel.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async deleteTravel (req, res) {
    // check ownership
    this.#validateOwnership(req.doc, req.user.id)

    const { id } = req.params

    // Delete from local DB
    await TravelModel.deleteOne({ _id: id })

    logger.info(`Deleted travel with id ${id}`)

    res.sendStatus(204)
  }

  /**
   * Validate so the current user is the owner of the travel document.
   *
   * @param {object} travel The travel doc.
   * @param {string} userId The user id.
   */
  #validateOwnership (travel, userId) {
    if (!travel.userId.equals(userId)) {
      throw createError(403, 'You are not authorized to modify this image.')
    }
  }

  /**
   * Helper function for placecontroller to find right travel by travel id and also validates owner.
   *
   * @param {string} travelId The id of the travel.
   * @param {string} userId The user id.
   * @returns {Promise<TravelModel>} - Resolves with the travel document if ownership is valid.
   */
  async findTravelByIdWithOwnershipCheck (travelId, userId) {
    const travel = await TravelModel.findById(travelId)
    if (!travel) throw createError(404, 'Travel not found')

    this.#validateOwnership(travel, userId) // throws if ownership invalid

    return travel
  }

  /**
   * Finds all public travels and populates their places.
   *
   * @returns {Promise<Array>} Array of public travels with populated places.
   */
  async findAllPublicTravelsWithPlaces () {
    return TravelModel.find({ isPublic: true }).populate('places')
  }
}
