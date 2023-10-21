import mongoose from 'mongoose'
import type { Document } from 'mongoose'

const Schema = mongoose.Schema

const UserSchema = new Schema({
  id: String,
  is_bot: Boolean,
  first_name: String,
  last_name: String,
  username: String,
  language_code: String,
  hasPremium: Boolean,
  login_date: Date
})

export type UserDocument = typeof UserSchema & Document

export const User = mongoose.model('User', UserSchema)
