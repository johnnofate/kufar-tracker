import { TelegramBotService } from './services/tg-service'

export class KufarTracker {
  private readonly botService: TelegramBotService = new TelegramBotService()

  public start (): void {
    this.botService.sendMessageAppStarted()
    this.botService.subscribeToMessages()
    this.botService.render()
  }
}
