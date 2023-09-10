import { TelegramBotService } from "./services/tg-service";

export class KufarTracker {

    private botService: TelegramBotService = new TelegramBotService();

    public start(): void {
        const renderInterval: NodeJS.Timeout = setInterval(async () => {
            this.botService.render();
        }, 5000);

        clearInterval(renderInterval);

        this.botService.subscribeToMessages();
        this.botService.render();
    }
}