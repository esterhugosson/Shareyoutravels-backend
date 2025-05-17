/**
 * @file Defines the AccountController class.
 * @module controllers/AccountController
 * @author Ester Hugosson
 * @version 1.0.0
 */

import http from 'node:http'
import { logger } from '../../config/winston.js'
import { JsonWebToken } from '../../lib/JsonWebToken.js'
import { UserModel } from '../../models/UserModel.js'
import createError from 'http-errors'
import dotenv from 'dotenv'
dotenv.config()

/**
 * Encapsulates a controller.
 */
export class AccountController {
  /**
   * Authenticates a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async signin (req, res, next) {
    try {
      logger.silly('Authenticating user', { body: req.body })

      const userDocument = await UserModel.authenticate(req.body.username, req.body.password)
      const user = userDocument.toObject()

      // Create the access token with the shorter lifespan.
      const accessToken = await JsonWebToken.encodeUser(user,
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_LIFE
      )

      // Create the refresh token with the longer lifespan.
      const refreshToken = await JsonWebToken.encodeUser(
        user,
        process.env.REFRESH_TOKEN_SECRET,
        process.env.REFRESH_TOKEN_LIFE
      )

      console.log(accessToken)
      console.log(refreshToken)

      console.log('Authenticated user', { user })

      res
        .status(200)
        .json({
          access_token: accessToken,
          refresh_token: refreshToken,
          user
        })
    } catch (error) {
      // Authentication failed.
      const httpStatusCode = 401
      const err = new Error(http.STATUS_CODES[httpStatusCode])
      err.status = httpStatusCode
      err.cause = error

      next(err)
    }
  }

  /**
   * Registers a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async register (req, res, next) {
    try {
      const { firstName, lastName, username, email, password } = req.body

      // --- Manual validation ---
      const errors = []

      if (!firstName || typeof firstName !== 'string') errors.push('Invalid or missing firstName')
      if (!lastName || typeof lastName !== 'string') errors.push('Invalid or missing lastName')
      if (!username || typeof username !== 'string') errors.push('Invalid or missing username')
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Invalid or missing email')
      if (!password || typeof password !== 'string' || password.length < 6) {
        errors.push('Password must be at least 6 characters')
      }

      if (errors.length > 0) {
        const err = new Error('Validation Error')
        err.status = 400
        err.cause = errors
        return next(err)
      }

      const userDocument = await UserModel.create({
        firstName,
        lastName,
        username,
        email,
        password
      })

      const location = new URL(
        `${req.protocol}://${req.get('host')}${req.baseUrl}/${userDocument.id}`
      )

      res
        .location(location.href)
        .status(201)
        .json({ id: userDocument.id })
    } catch (error) {
      let httpStatusCode = 500

      if (error.code === 11_000) {
        // Duplicated keys.
        httpStatusCode = 409
      } else if (error.name === 'ValidationError') {
        // Validation error(s).
        httpStatusCode = 400
      }

      const err = new Error(http.STATUS_CODES[httpStatusCode])
      err.status = httpStatusCode
      err.cause = error

      next(err)
    }
  }

  /**
   * Refreshes the access token using a valid refresh token.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async refreshToken (req, res, next) {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        const err = new Error('Refresh token is missing or invalid')
        err.status = 400
        throw err
      }

      // Decode and verify the refresh token.
      const decodedUser = await JsonWebToken.decodeUser(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      )

      const userDocument = await UserModel.findById(decodedUser.id)
      if (!userDocument) {
        const err = new Error('User not found')
        err.status = 401
        throw err
      }

      const user = userDocument.toObject()

      // Create a new access token
      const newAccessToken = await JsonWebToken.encodeUser(
        user,
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_LIFE
      )

      // Rotate refresh token
      const newRefreshToken = await JsonWebToken.encodeUser(
        user,
        process.env.REFRESH_TOKEN_SECRET,
        process.env.REFRESH_TOKEN_LIFE
      )

      res.status(200).json({
        access_token: newAccessToken,
        refresh_token: newRefreshToken
      })
    } catch (error) {
      const err = createError(401, 'Invalid refresh token', { cause: error })
      next(err)
    }
  }

  /**
   * Updates the account information for a user.
   * 
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async updaeAccountInformation (req, res, next) {
    try {
      const userId = req.user.id

      // Extract fields that can be updated
      const { firstName, lastName, username, email, password } = req.body

      // --- Manual validation ---
      const errors = []

      if (firstName !== undefined && (typeof firstName !== 'string' || firstName.trim() === '')) {
        errors.push('Invalid firstName')
      }
      if (lastName !== undefined && (typeof lastName !== 'string' || lastName.trim() === '')) {
        errors.push('Invalid lastName')
      }
      if (username !== undefined && (typeof username !== 'string' || username.trim() === '')) {
        errors.push('Invalid username')
      }
      if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Invalid email')
      }
      if (password !== undefined && (typeof password !== 'string' || password.length < 6)) {
        errors.push('Password must be at least 6 characters')
      }

      if (errors.length > 0) {
        const err = new Error('Validation Error')
        err.status = 400
        err.cause = errors
        return next(err)
      }

      // Prepare update object, only set fields if they exist
      const updateData = {}
      if (firstName !== undefined) updateData.firstName = firstName
      if (lastName !== undefined) updateData.lastName = lastName
      if (username !== undefined) updateData.username = username
      if (email !== undefined) updateData.email = email
      if (password !== undefined) updateData.password = password

      // Update the user document
      const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true })

      if (!updatedUser) {
        return next(createError(404, 'User not found'))
      }

      res.status(200).json({ message: 'Account updated successfully', user: updatedUser.toObject() })
    } catch (error) {
      let httpStatusCode = 500

      if (error.code === 11000) {
        // Duplicated keys
        httpStatusCode = 409
      } else if (error.name === 'ValidationError') {
        // Mongoose validation error
        httpStatusCode = 400
      }

      const err = new Error(http.STATUS_CODES[httpStatusCode])
      err.status = httpStatusCode
      err.cause = error
      next(err)
    }
  }

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  async deleteAccount (req, res, next) {
    try {
      const userId = req.user.id

      const deletedUser = await UserModel.findByIdAndDelete(userId)

      if (!deletedUser) {
        return next(createError(404, 'User not found'))
      }

      res.status(200).json({ message: 'Account deleted successfully' })
    } catch (error) {
      const err = new Error(http.STATUS_CODES[500])
      err.status = 500
      err.cause = error
      next(err)
    }
  }
}
