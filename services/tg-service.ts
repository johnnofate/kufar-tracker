import dotenv from "dotenv";
dotenv.config();

import TelegramBot, { Message } from "node-telegram-bot-api";
import * as interfaces from "../interfaces";
import { clients, handleMessages } from "../hooks/handle-message-hook";
import { HttpService } from "./http-service";
import config from "config";

export class TelegramBotService {

    private readonly TOKEN: string = process.env.TOKEN ?? "";
    private readonly KUFAR_PHOTO_API_URL: string = config.get("KUFAR_PHOTO_API_URL");
    private readonly renderDelayInMilliseconds: number = 10000;
    private readonly httpService = new HttpService();


    private bot: TelegramBot = new TelegramBot(this.TOKEN, { polling: true });

    public subscribeToMessages(): void {
        this.bot.onText(/()/, (message: Message) => {
            console.log(message.from?.first_name, message.chat.id);
            handleMessages(this.bot, message);
        });
    }

    public sendMessageAppStarted() {
        const usersIds: number[] = [1017548710, 1485419781, 1175319115];

        usersIds.forEach((userId: number) => {
            this.bot.sendMessage(userId, "Бот был перезапущен, подпишитесь снова, если вы были подписаны");
        });
    }

    public render() {
        setInterval(() => {
            const clientsIds: string[] = Object.keys(clients);

            if (clientsIds.length) {
                clientsIds.forEach(async (id: string) => {
                    const client = clients[id];

                    if (!client) return;

                    const result: interfaces.IResult | undefined = await this.httpService.getKufarPosts(client.searchParams);

                    if (result) {
                        if (result.error) {
                            console.error(result.error);
                        }

                        if (result.posts && result.posts.length) {
                            const sortedResult: interfaces.IResultPost[] = result.posts.filter((post: interfaces.IResultPost) => {
                                const prevPostsCandidate = client.prevPosts.filter((prevPost: interfaces.IResultPost) => prevPost.link.trim() === post.link.trim());
                                return prevPostsCandidate.length <= 0;
                            });
                            client.prevPosts.push(...sortedResult);

                            if (sortedResult.length) {
                                sortedResult.forEach((post: interfaces.IResultPost) => {
                                    let content: string = "";                                    

                                    const priceLeft = post.price.slice(0, post.price.length - 2);
                                    const priceRight = post.price.slice(post.price.length - 2, post.price.length - 1);

                                    content += `${post.title}\n`;
                                    content += `${priceLeft}.${priceRight} руб\n`;
                                    content += `${post.link}`;

                                    if (post.imageLink) {
                                        this.bot.sendPhoto(id, this.KUFAR_PHOTO_API_URL + post.imageLink, {
                                            caption: content
                                        });
                                    } else {
                                        this.bot.sendMessage(id, content);
                                    }
                                });
                            }
                        }
                    }
                });
            }
        }, this.renderDelayInMilliseconds);
    }
}