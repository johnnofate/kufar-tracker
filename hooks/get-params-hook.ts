import TelegramBot, { Message } from "node-telegram-bot-api";
import * as interfaces from "../interfaces";
import { send } from "./send-hook";

export function getSearchParams(bot: TelegramBot, message: Message): Promise<interfaces.ISearchParams> {
    const searchParams: interfaces.ISearchParams = {
        [interfaces.searchParamsKeysEnum.category]: "",
        [interfaces.searchParamsKeysEnum.region]: "",
        [interfaces.searchParamsKeysEnum.model]: [],
        [interfaces.searchParamsKeysEnum.producer]: "",
        [interfaces.searchParamsKeysEnum.price_min]: -1,
        [interfaces.searchParamsKeysEnum.price_max]: Infinity,
        [interfaces.searchParamsKeysEnum.has_photo]: null,
        [interfaces.searchParamsKeysEnum.storage]: [],
        [interfaces.searchParamsKeysEnum.current_date]: Date.now() - 120000,
        [interfaces.searchParamsKeysEnum.page_size]: 200
    };

    const messageOptions = {
        reply_markup: {
            force_reply: true
        }
    };

    return new Promise((res) => {
        const messageStorageHandler = (messageAnswer: Message) => {
            const val: string = messageAnswer.text?.toLocaleLowerCase() ?? "пусто";

            if (messageAnswer.text?.toLocaleLowerCase() !== "пусто") {
                searchParams[interfaces.searchParamsKeysEnum.storage] = val.split(", ");
            }

            res(searchParams);
        };

        const messageHasPhotoHandler = async (messageAnswer: Message) => {
            const val: string = messageAnswer.text?.toLocaleLowerCase() ?? "пусто";

            if (messageAnswer.text?.toLocaleLowerCase() !== "пусто") {
                searchParams[interfaces.searchParamsKeysEnum.has_photo] = val.toUpperCase() === "ДА";
            }

            const messageStorage = await send(bot, messageAnswer, interfaces.responseSuccessMessage.postStorage, messageOptions);
            bot.onReplyToMessage(message.chat.id, messageStorage.message_id, messageStorageHandler);
        };

        const messagePriceMaxHandler = async (messageAnswer: Message) => {
            const val: string = messageAnswer.text?.toLocaleLowerCase() ?? "пусто";

            if (messageAnswer.text?.toLocaleLowerCase() !== "пусто" && Number(val)) {
                searchParams[interfaces.searchParamsKeysEnum.price_max] = Number(val + "00");
            }

            const messageHasPhoto = await send(bot, messageAnswer, interfaces.responseSuccessMessage.postHasPhoto, messageOptions);
            bot.onReplyToMessage(message.chat.id, messageHasPhoto.message_id, messageHasPhotoHandler);
        };

        const messagePriceMinHandler = async (messageAnswer: Message) => {
            const val: string = messageAnswer.text?.toLocaleLowerCase() ?? "пусто";

            if (messageAnswer.text?.toLocaleLowerCase() !== "пусто" && Number(val)) {
                searchParams[interfaces.searchParamsKeysEnum.price_min] = Number(val + "00");
            }

            const messagePriceMax = await send(bot, messageAnswer, interfaces.responseSuccessMessage.postPriceMax, messageOptions);
            bot.onReplyToMessage(message.chat.id, messagePriceMax.message_id, messagePriceMaxHandler);
        };

        const messageProducerHandler = async (messageAnswer: Message) => {
            const val: string = messageAnswer.text?.toLocaleLowerCase() ?? "пусто";

            if (messageAnswer.text?.toLocaleLowerCase() !== "пусто") {
                searchParams[interfaces.searchParamsKeysEnum.producer] = val;
            }

            const messagePriceMin = await send(bot, messageAnswer, interfaces.responseSuccessMessage.postPriceMin, messageOptions);
            bot.onReplyToMessage(message.chat.id, messagePriceMin.message_id, messagePriceMinHandler);
        };

        const messageModelHandler = async (messageAnswer: Message) => {
            const val: string = messageAnswer.text?.toLocaleLowerCase() ?? "пусто";

            if (messageAnswer.text?.toLocaleLowerCase() !== "пусто") {
                searchParams[interfaces.searchParamsKeysEnum.model] = val.split(", ");
            }

            const messageProducer = await send(bot, messageAnswer, interfaces.responseSuccessMessage.postProducer, messageOptions);
            bot.onReplyToMessage(message.chat.id, messageProducer.message_id, messageProducerHandler);
        };

        const messageRegionHandler = async (messageAnswer: Message) => {
            const val: string = messageAnswer.text?.toLocaleLowerCase() ?? "пусто";

            if (messageAnswer.text?.toLocaleLowerCase() !== "пусто") {
                searchParams[interfaces.searchParamsKeysEnum.region] = val;
            }

            const messageModel = await send(bot, messageAnswer, interfaces.responseSuccessMessage.postModel, messageOptions);
            bot.onReplyToMessage(message.chat.id, messageModel.message_id, messageModelHandler);
        };

        const messageCategoryHandler = async (messageAnswer: Message) => {
            const val: string = messageAnswer.text?.toLocaleLowerCase() ?? "пусто";

            if (messageAnswer.text?.toLocaleLowerCase() !== "пусто") {
                searchParams[interfaces.searchParamsKeysEnum.category] = val;
            }

            const messageRegion = await send(bot, messageAnswer, interfaces.responseSuccessMessage.postRegion, messageOptions);
            bot.onReplyToMessage(message.chat.id, messageRegion.message_id, messageRegionHandler);
        };

        send(bot, message, interfaces.responseSuccessMessage.postCategory, messageOptions)
            .then((messageCategory) => {
                bot.onReplyToMessage(message.chat.id, messageCategory.message_id, messageCategoryHandler);
            });
    });
}