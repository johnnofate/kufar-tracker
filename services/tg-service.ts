import dotenv from "dotenv";
dotenv.config();

import TelegramBot, { Message } from "node-telegram-bot-api";
import * as interfaces from "../interfaces";
import { clients, handleMessages } from "../hooks/handle-message-hook";
import { HttpService } from "./http-service";
import fs from "fs";
import path from "path";

export class TelegramBotService {

    private readonly TOKEN: string = process.env.TOKEN ?? "";
    private readonly renderDelayInMilliseconds: number = 10000;
    private readonly httpService = new HttpService();


    private bot: TelegramBot = new TelegramBot(this.TOKEN, { polling: true });

    public subscribeToMessages(): void {
        this.bot.onText(/()/, (message: Message) => {
            handleMessages(this.bot, message);
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
                                                 
                                    const cockFilePath: string = path.join(__dirname, "../../", "cock.txt");
                                    const cock: string = fs.readFileSync(cockFilePath, { encoding: "utf-8" });

                                    const priceLeft = post.price.slice(0, post.price.length-2);
                                    const priceRight = post.price.slice(post.price.length-2, post.price.length-1);

                                    content += `${cock}\n\n`;
                                    content += `${post.title}\n`;
                                    content += `${priceLeft}.${priceRight} руб\n`;
                                    content += `${post.link}`;

                                    this.bot.sendMessage(id, content);
                                });
                            }
                        }
                    }
                });
            }
        }, this.renderDelayInMilliseconds);
    }
}