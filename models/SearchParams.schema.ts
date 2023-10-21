import mongoose from 'mongoose'
import type { Document } from 'mongoose'

const Schema = mongoose.Schema

const SearchParamsSchema = new Schema({
  ownerId: Schema.ObjectId,
  isDefault: Boolean,
  category: String,
  region: String,
  model: Array,
  producer: String,
  price_min: Number,
  price_max: Number,
  has_photo: { type: Boolean, required: false, default: null },
  storage: Array,
  current_date: Number,
  create_date: Date
})

export type SearchParamsDocument = typeof SearchParamsSchema & Document

export const SearchParams = mongoose.model('SearchParams', SearchParamsSchema)
