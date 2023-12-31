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
      subscribes: [],
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
      .then(async () => {
        const currentSearchParams = await SearchParams.findOne({ ownerId: candidate._id })

        if (currentSearchParams === null || currentSearchParams === undefined) {
          return {
            state: false,
            message: interfaces.responseErrorMessage.noSearchParams
          }
        }

        await User.findByIdAndUpdate(candidate._id, { subscribe: currentSearchParams._id })
        return { state: true, message: `New Search Params by \`${user.id}\` added successfully!` }
      })
      .catch(error => ({ state: false, message: error }))
  }

  public async removeSearchParams (chatId: number): Promise<interfaces.IMongoDBAddSearchParamsResponse> {
    if (chatId === undefined) return await Promise.resolve({ state: false, message: interfaces.responseErrorMessage.somethingWentWrong })

    const candidateUser = await User.findOne({ id: chatId })

    if (candidateUser === null) return await Promise.resolve({ state: false, message: interfaces.responseErrorMessage.somethingWentWrong })

    const candidateSearchParams = await SearchParams.findOne({ _id: candidateUser.subscribe })

    if (candidateSearchParams === null || candidateSearchParams === undefined) return await Promise.resolve({ state: false, message: interfaces.responseErrorMessage.noSearchParams })

    if (candidateSearchParams.isDefault === true) {
      return await User.findByIdAndUpdate(candidateUser._id, { subscribe: undefined })
        .then(() => ({ state: true, message: interfaces.responseSuccessMessage.unsubscribeSuccess }))
        .catch(error => {
          console.log(error)
          return ({ state: false, message: interfaces.responseErrorMessage.somethingWentWrong })
        })
    }

    return await Promise.all([
      User.findByIdAndUpdate(candidateUser._id, { subscribe: undefined }),
      SearchParams.deleteOne({ ownerId: candidateUser._id, isDefault: false })
    ])
      .then(() => ({ state: true, message: interfaces.responseSuccessMessage.unsubscribeSuccess }))
      .catch(error => {
        console.log(error)
        return ({ state: false, message: interfaces.responseErrorMessage.somethingWentWrong })
      })
  }

  public async getUserSearchParams (id: typeof mongoose.Schema.ObjectId): Promise<interfaces.ISearchParams | null | undefined> {
    const user = await User.findById(id)

    if (user === null || user === undefined) return await Promise.resolve(null)

    const searchParams: interfaces.ISearchParams | null | undefined = await SearchParams.findById(user.subscribe)
    return searchParams
  }

  public async getDefaultSearchParams (): Promise<interfaces.ISearchParams | undefined> {
    const searchParams = await SearchParams.findOne({ isDefault: true })
    return searchParams ?? undefined
  }
}
