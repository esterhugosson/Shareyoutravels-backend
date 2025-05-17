import { BASE_SCHEMA } from './baseSchema.js'
import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  travelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Travel',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  dateVisited: {
    type: Date,
  },
  funFacts: {
    type: [String], 
    default: [],
  },
  rating: {
    type: Number
  }
})

schema.add(BASE_SCHEMA)

// Create a model using the schema.
export const PlaceModel = mongoose.model('Place', schema)
