import TelegramBot, { Message } from "node-telegram-bot-api";
import * as interfaces from "../interfaces";
import { getSearchParams } from "./get-params-hook";
import { send } from "./send-hook";

export let isReply: boolean = false;

export const clients: interfaces.IClients = {
    "1017548710": {
        searchParams: {
            category: "мобильные телефоны",
            model: ["iphone 12", "iphone 12 mini", "iphone xs", "iphone xs max", "iphone 11", "iphone 11 pro", "iphone 11 pro max"],
            producer: "apple",
            region: "минск",
            has_photo: true,
            price_min: -1,
            price_max: 1500,
            storage: ["128", "256", "512"],
            current_date: Date.now(),
            page_size: 200,
        },
        prevPosts: [],
    },
    "1485419781": {
        searchParams: {
            category: "мобильные телефоны",
            model: ["iphone 12", "iphone 12 mini", "iphone xs", "iphone xs max", "iphone 11", "iphone 11 pro", "iphone 11 pro max"],
            producer: "apple",
            region: "минск",
            has_photo: true,
            price_min: -1,
            price_max: 1500,
            storage: ["128", "256", "512"],
            current_date: Date.now(),
            page_size: 200,
        },
        prevPosts: [],
    },
    "1175319115": {
        searchParams: {
            category: "мобильные телефоны",
            model: ["iphone 12", "iphone 12 mini", "iphone xs", "iphone xs max", "iphone 11", "iphone 11 pro", "iphone 11 pro max"],
            producer: "apple",
            region: "минск",
            has_photo: true,
            price_min: -1,
            price_max: 1500,
            storage: ["128", "256", "512"],
            current_date: Date.now(),
            page_size: 200,
        },
        prevPosts: [],
    },
};

export async function handleMessages(bot: TelegramBot, message: Message): Promise<void> {
    const includesCommand = interfaces.commands.filter((command: string) => {
        return command === message.text;
    });

    if (includesCommand.length <= 0 && !isReply) {
        send(bot, message, interfaces.responseErrorMessage.indefiniteCommand);
    }

    switch (message.text) {
    case interfaces.commandsEnum.start:
        send(bot, message, interfaces.responseSuccessMessage.start(message));
        break;
    case interfaces.commandsEnum.subscribe: {
        if (Object.keys(clients[message.chat.id] || {}).length) {
            send(bot, message, interfaces.responseSuccessMessage.alreadySubscribed);
            return;
        }

        send(bot, message, interfaces.responseSuccessMessage.subscribeInfo);

        isReply = true;

        const searchParams: interfaces.ISearchParams = await getSearchParams(bot, message);

        isReply = false;

        if (message.chat && message.chat.id) {
            send(bot, message, interfaces.responseSuccessMessage.subscribeSuccess);

            clients[message.chat.id] = {
                searchParams,
                prevPosts: []
            };
        }

        break;
    }
    case interfaces.commandsEnum.unsubscribe:
        if (message.chat && message.chat.id) {
            clients[message.chat.id] = undefined;
        }
        send(bot, message, interfaces.responseSuccessMessage.unsubscribeSuccess);
        break;
    default:
        break;
    }
}