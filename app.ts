import { TelegramBotService } from "./services/tg-service";

export class KufarTracker {

    private botService: TelegramBotService = new TelegramBotService();

    public start(): void {
        this.botService.sendMessageAppStarted();
        this.botService.subscribeToMessages();
        this.botService.render();
    }
}