import mongoose from 'mongoose'
import { BASE_SCHEMA } from './baseSchema.js'

// Create a schema.
const schema = new mongoose.Schema({
  destination: {
    type: String,
    required: [true, 'Destination is required.'],
    trim: true
  },
  transport: {
    type: String,
    required: [true, 'Transport is required.'],
    trim: true,
    enum: {
      values: ['flight', 'vehicle', 'train', 'other'],
      message: 'Transport must be one of: flight, vehicle, train, other.'
    }
  },
  notes: {
    type: String,
    maxLength: 255
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required.']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required.'],
    validate: {
      /**
       * Validate so the end date is after the start date.
       *
       * @param {Date} value The end date to be valued.
       * @returns {boolean} True or false if the end date is after the start date.
       */
      validator: function (value) {
        return this.startDate <= value
      },
      message: 'End date must be after start date.'
    }
  },
  location: {
    lat: {
      type: Number,
      required: [true, 'Latitude is required.'],
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required.'],
      min: -180,
      max: 180
    }
  },
  places: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place'
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
})

schema.add(BASE_SCHEMA)

// Create a model using the schema.
export const TravelModel = mongoose.model('Travel', schema)
