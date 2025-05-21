/**
 * @file Defines the account router.
 * @module routes/accountRouter
 * @author Ester Hugosson
 * @version 1.0.0
 */

import express from 'express'
import { AccountController } from '../../../controllers/api/AccountController.js'
import { authenticateJWT } from '../../../middlewares/auth.js'

export const router = express.Router()

const controller = new AccountController()

// Provide req.user to the route if :id is present in the route path.
router.param('id', (req, res, next, id) => controller.loadUserDocument(req, res, next, id))

// Log in
router.post('/signin', (req, res, next) => controller.signin(req, res, next))

// Register
router.post('/register', (req, res, next) => controller.register(req, res, next))

// Refreshtoken
router.post('/refresh', (req, res, next) => controller.refreshToken(req, res, next))

// All routes are protected below
router.use(authenticateJWT)

// update
router.patch('/update', (req, res, next) => controller.updateAccountInformation(req, res, next))

// delete
router.delete('/delete', (req, res, next) => controller.deleteAccount(req, res, next))
