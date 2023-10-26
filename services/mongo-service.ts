import mongoose, { type Document } from 'mongoose'
import { config } from 'dotenv'
import type { User as TgUserType } from 'node-telegram-bot-api'
import { User } from '../models/User.schema'
import * as interfaces from '../interfaces'
import { SearchParams } from '../models/SearchParams.schema'

config()

const MONGO_URI: string = process.env.MONGO_URI ?? ''

export class MongoDB {
  public async connect (): Promise<interfaces.IMongoDBConnectResponse> {
    return await mongoose.connect(MONGO_URI)
      .then(() => ({ state: true, message: 'Connected to MongoDB successfully!' }))
      .catch(error => ({ state: false, message: error }))
  }

  public async login (user: TgUserType | undefined): Promise<interfaces.IMongoDBLoginResponse> {
    if (user === undefined) return await Promise.resolve({ state: false, message: 'User data not found.' })

    const candidate = await User.findOne({ id: user.id })
      .then(response => response)
      .catch(() => null)

    if (candidate !== null) return await Promise.resolve({ state: false, message: `User \`${user.id}\` already exists.` })

    const newUser = new User({
      ...user,
      hasPremium: false,
      login_date: new Date()
    })

    return await newUser.save()
      .then(() => ({ state: true, message: `User \`${user.id}\` logged in successfully!` }))
      .catch(error => ({ state: false, message: error }))
  }

  // User

  public async getAllUsers (): Promise<interfaces.IMongoUser[]> {
    const users: interfaces.IMongoUser[] = await User.find()
    return users
  }

  public async getUserByTgId (id: number): Promise<interfaces.IMongoUser | null> {
    const user: interfaces.IMongoUser | null = await User.findOne({ id })
    return user
  }

  // Search params

  public async addSearchParams (user: TgUserType | undefined, searchParams: interfaces.ISearchParams): Promise<interfaces.IMongoDBAddSearchParamsResponse> {
    if (user === undefined) return await Promise.resolve({ state: false, message: 'User data not found.' })

    const candidate = await User.findOne({ id: user.id })

    if (candidate === null) return await Promise.resolve({ state: false, message: `User \`${user.id}\` not found.` })

    const newSearchParams: Document<any> = new SearchParams({
      ownerId: candidate._id,
      ...searchParams,
      has_photo: searchParams.has_photo === null ? undefined : searchParams.has_photo,
      isDefault: false,
      create_date: new Date()
    })

    return await newSearchParams.save()
      .then(() => ({ state: true, message: `New Search Params by \`${user.id}\` added successfully!` }))
      .catch(error => ({ state: false, message: error }))
  }

  public async removeSearchParams (id: number): Promise<interfaces.IMongoDBAddSearchParamsResponse> {
    if (id === undefined) return await Promise.resolve({ state: false, message: 'User data not found.' })

    const candidateUser = await User.findOne({ id })

    if (candidateUser === null) return await Promise.resolve({ state: false, message: `User \`${id}\` not found.` })

    const candidateSearchParams = await SearchParams.findOne({ owner: candidateUser._id })

    if (candidateSearchParams === null) return await Promise.resolve({ state: false, message: `User \`${id}\` haven't search params.` })

    return await SearchParams.deleteOne({ owner: candidateUser._id })
      .then(() => ({ state: true, message: interfaces.responseSuccessMessage.unsubscribeSuccess }))
      .catch(error => ({ state: false, message: error }))
  }

  public async getUserSearchParams (id: typeof mongoose.Schema.ObjectId): Promise<interfaces.ISearchParams | null | undefined> {
    const searchParams: interfaces.ISearchParams | null | undefined = await SearchParams.findOne({ ownerId: id })
    return searchParams
  }

  public async getDefaultSearchParams (): Promise<interfaces.ISearchParams | undefined> {
    const searchParams = await SearchParams.findOne({ isDefault: true })
    return searchParams ?? undefined
  }
}
