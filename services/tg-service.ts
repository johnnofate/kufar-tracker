import dotenv from 'dotenv'

import TelegramBot, { type Message } from 'node-telegram-bot-api'
import * as interfaces from '../interfaces'
import { clients, handleMessages } from '../hooks/handle-message-hook'
import { HttpService } from './http-service'
import config from 'config'
dotenv.config()

export class TelegramBotService {
  private readonly TOKEN: string = process.env.TOKEN ?? ''
  private readonly KUFAR_PHOTO_API_URL: string = config.get('KUFAR_PHOTO_API_URL')
  private readonly renderDelayInMilliseconds: number = 10000
  private readonly httpService = new HttpService()

  private readonly bot: TelegramBot = new TelegramBot(this.TOKEN, { polling: true })

  public subscribeToMessages (): void {
    this.bot.onText(/()/, (message: Message): void => {
      handleMessages(this.bot, message)
        .then(() => { })
        .catch(() => { })
    })
  }

  public sendMessageAppStarted (): void {
    // const usersIds: number[] = [1017548710, 1485419781, 1175319115]

    // usersIds.forEach((userId: number): void => {
    //   this.bot.sendMessage(userId, interfaces.responseSuccessMessage.botRestart)
    //     .then(() => { })
    //     .catch(() => { })
    // })
  }

  public render (): void {
    setInterval(() => {
      const clientsIds: string[] = Object.keys(clients)

      if (clientsIds.length > 0) {
        clientsIds.forEach((id: string): void => {
          const client = clients[id]

          if (client === undefined) return

          this.httpService.getKufarPosts(client.searchParams)
            .then((result: interfaces.IResult | undefined) => {
              console.log(result)
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

                  this.bot.sendPhoto(id, this.KUFAR_PHOTO_API_URL + post.imageLink, {
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
      }
    }, this.renderDelayInMilliseconds)
  }
}
