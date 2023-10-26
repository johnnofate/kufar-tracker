import dotenv from 'dotenv'

import TelegramBot, { type Message } from 'node-telegram-bot-api'
import * as interfaces from '../interfaces'
import { handleMessages } from '../hooks/handle-message-hook'
import { HttpService } from './http-service'
import config from 'config'
import type { MongoDB } from './mongo-service'
dotenv.config()

export class TelegramBotService {
  private readonly TOKEN: string = process.env.TOKEN ?? ''
  private readonly KUFAR_PHOTO_API_URL: string = config.get('KUFAR_PHOTO_API_URL')
  private readonly renderDelayInMilliseconds: number = 10000
  private readonly httpService = new HttpService()
  private readonly mongoService: MongoDB

  private readonly bot: TelegramBot = new TelegramBot(this.TOKEN, { polling: true })

  private readonly clients: interfaces.IClients = {}

  constructor (mongoService: MongoDB) {
    this.mongoService = mongoService
  }

  public subscribeToMessages (): void {
    this.bot.onText(/()/, (message: Message): void => {
      this.mongoService.login(message.from)
        .then(({ state, message }: interfaces.IMongoDBLoginResponse) => {
          state && console.log(message)
        })
        .catch(({ state, message }: interfaces.IMongoDBLoginResponse) => {
          console.error(message)
        })

      void this.mongoService.getUserByTgId(message.chat.id)
        .then((user: interfaces.IMongoUser | null) => {
          if (user === null || !user.hasPremium) {
            this.bot.sendMessage(message.chat.id, interfaces.responseErrorMessage.noAccess)
              .then(() => { })
              .catch(() => { })
            return
          }

          handleMessages(this.bot, message, this.clients, this.mongoService)
            .then((searchParams: interfaces.ISearchParams | undefined) => {
              if (searchParams === undefined || message === undefined) return
              if (message.from === undefined) return
              this.clients[message.from.id] = {
                searchParams,
                prevPosts: []
              }

              this.mongoService.addSearchParams(message.from, searchParams)
                .then(({ state, message }) => {
                  console.log(message)
                })
                .catch(({ state, message }) => {
                  console.log(message)
                })
            })
            .catch(() => { })
        })
    })
  }

  public render (): void {
    setInterval(() => {
      void this.mongoService.getAllUsers()
        .then((users: interfaces.IMongoUser[]) => {
          users.forEach((user: interfaces.IMongoUser) => {
            void this.mongoService.getUserSearchParams(user._id)
              .then((userSearchParams) => {
                if (userSearchParams === null || userSearchParams === undefined) {
                  return
                }

                if (userSearchParams === null || userSearchParams === undefined) return

                if (this.clients[user.id] === undefined) {
                  const client: interfaces.IResultPosts = {
                    searchParams: userSearchParams ?? {},
                    prevPosts: []
                  }
                  this.clients[user.id] = client
                }

                this.httpService.getKufarPosts(userSearchParams)
                  .then((result: interfaces.IResult | undefined) => {
                    const client: interfaces.IResultPosts | undefined = this.clients[user.id]

                    if (client === undefined) {
                      this.clients[user.id] = client
                      return
                    }

                    if (result === undefined || result === null) return

                    if ((result.error !== undefined && result.error !== null) && result.error.length > 0) {
                      return
                    }

                    if (result.posts === undefined || result.posts === null) return
                    if (result.posts.length <= 0) return

                    const sortedResult: interfaces.IResultPost[] = result.posts.filter((post: interfaces.IResultPost) => {
                      const prevPostsCandidate = client.prevPosts.filter((prevPost: interfaces.IResultPost) => prevPost.link.trim() === post.link.trim())
                      return prevPostsCandidate.length <= 0
                    })

                    client.prevPosts.unshift(...sortedResult)

                    if (client.prevPosts.length > 200) {
                      client.prevPosts = client.prevPosts.filter((_, index) => index < 200)
                    }

                    if (sortedResult.length > 0) {
                      sortedResult.forEach((post: interfaces.IResultPost): void => {
                        let content: string = ''

                        const priceLeft = post.price.slice(0, post.price.length - 2)
                        const priceRight = post.price.slice(post.price.length - 2, post.price.length - 1)

                        content += `${post.title}\n`
                        content += `${priceLeft}.${priceRight} руб`

                        this.bot.sendPhoto(user.id, this.KUFAR_PHOTO_API_URL + post.imageLink, {
                          caption: content,
                          reply_markup: {
                            inline_keyboard: [[{ text: 'Подробнее', url: post.link }]]
                          }
                        })
                          .then(() => { })
                          .catch(() => { })
                      })
                    }
                  })
                  .catch(() => { })
              })
          })
        })
    }, this.renderDelayInMilliseconds)
  }
}
