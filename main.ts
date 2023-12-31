import * as dotenv from 'dotenv'

import config from 'config'
import express, { type Application, type Request, type Response } from 'express'
import { KufarTracker } from './app'
import axios from 'axios'
dotenv.config()

export class Server {
  private readonly PORT: string
  private readonly app: Application = express()
  private readonly refreshDelayInMilliseconds = 60000
  private refreshCounter: number = 0

  constructor (port: string) {
    this.PORT = port
  }

  public listenPort (): void {
    this.app.get('/refresh', (req: Request, res: Response) => {
      if (this.refreshCounter === 0 || this.refreshCounter % 100 === 0) {
        console.log('refresh start')
      }

      const url: string = req.protocol + '://' + req.get('host') + req.originalUrl

      setTimeout(() => {
        this.refresh(url)
      }, this.refreshDelayInMilliseconds)

      this.refreshCounter++

      return res.status(200).end()
    })

    this.app.listen(this.PORT, () => {
      console.log(`Server start on ${this.PORT}`)
    })
  }

  private refresh (url: string): void {
    try {
      axios.get(url)
        .catch((err: unknown) => {
          if (axios.isAxiosError(err)) {
            console.error('error message: ', err.message)
            return
          }

          console.error('unexpected error: ', err)
        })
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('error message: ', error.message)
        return
      }

      console.error('unexpected error: ', error)
    }
  }

  public startApp (): void {
    const kufarTracker: KufarTracker = new KufarTracker()
    kufarTracker.start()
    this.refresh('https://kufar-tracker.onrender.com/refresh')
  }
}

const PORT: string = process.env.PORT ?? config.get('PORT')

const main = new Server(PORT)

main.listenPort()
main.startApp()

/*
название=iphone
категория=телефоны и планшеты
тип_категории(подкатегория)=мобильные телефон
город=минск
район=
модель=iphone 12, iphone 12 mini, iphone xs, iphone xs max, iphone 11, iphone 11 pro, iphone 11 pro max
производитель=apple
память=128, 256, 512
с_фото(да,нет)=да
минимальная_цена=
максимальная_цена=1600
*/
