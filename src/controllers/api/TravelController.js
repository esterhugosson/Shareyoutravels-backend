/**
 * @file Defines the TravelController class.
 * @module controllers/TravelController
 * @author Ester Hugosson
 * @version 1.0.0
 */

import { TravelModel } from '../../models/TravelModel.js'
import { logger } from '../../config/winston.js'
import createError from 'http-errors'
import mongoose from 'mongoose'
import httpContext from 'express-http-context'

/**
 * Encapsulates a controller.
 */
export class TravelController {
  /**
   *
   * @param req
   * @param res
   * @param next
   * @param id
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
   *
   * @param req
   * @param res
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
   *
   * @param req
   * @param res
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
   *
   * @param req
   * @param res
   */
  async myTravelsbyId (req, res) {
    // check ownership
    this.#validateOwnership(req.doc, req.user.id)

    const travel = req.doc

    res.status(200)
      .json(travel)
  }

  /**
   *
   * @param req
   * @param res
   */
  async createTravel (req, res) {
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

    const userId = req.user.id
    console.log(userId)

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

    res.status(201).json({
      message: 'Travel created successfully.',
      travel
    })
  }

  /**
   *
   * @param req
   * @param res
   */
  async updateTravel (req, res) {
    // check ownership
    //

    const { id } = req.params
    const travel = req.doc

    this.#validateOwnership(req.doc, req.user.id)

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

    if (destination !== undefined) travel.destination = destination
    if (transport !== undefined) travel.transport = transport
    if (notes !== undefined) travel.notes = notes
    if (places !== undefined) travel.places = places
    if (isPublic !== undefined) travel.isPublic = isPublic
    if (startDate !== undefined) travel.startDate = startDate
    if (endDate !== undefined) travel.endDate = endDate
    if (location !== undefined) travel.location = location

    await travel.save()

    res.status(200).json({ message: 'Travel updated successfully', travel })
  }

  /**
   *
   * @param req
   * @param res
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
   *
   * @param travel
   * @param userId
   */
  async #validateOwnership (travel, userId) {
    if (!travel.userId.equals(userId)) {
      throw createError(403, 'You are not authorized to modify this image.')
    }
  }

  /**
   *
   * @param travelId
   * @param userId
   */
  async findTravelByIdWithOwnershipCheck (travelId, userId) {
    const travel = await TravelModel.findById(travelId)
    if (!travel) throw createError(404, 'Travel not found')

    this.#validateOwnership(travel, userId) // throws if ownership invalid

    return travel
  }
}
