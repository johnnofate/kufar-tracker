import type { IMongoDBConnectResponse } from './interfaces'
import { MongoDB } from './services/mongo-service'
import { TelegramBotService } from './services/tg-service'

export class KufarTracker {
  private readonly mongoService: MongoDB = new MongoDB()
  private readonly botService: TelegramBotService = new TelegramBotService(this.mongoService)

  public start (): void {
    this.mongoService.connect()
      .then(({ state, message }: IMongoDBConnectResponse) => {
        console.log(message)
      })
      .catch(({ state, message }: IMongoDBConnectResponse) => {
        console.error(message)
      })
    this.botService.subscribeToMessages()
    this.botService.render()
  }
}
