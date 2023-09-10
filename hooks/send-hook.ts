import TelegramBot, { Message } from "node-telegram-bot-api";

export async function send(bot: TelegramBot, message: Message, text: string, options: TelegramBot.SendMessageOptions = {}): Promise<TelegramBot.Message> {
    if (text.length) {
        try {
            const newMessage = await bot.sendMessage(message.chat.id, text, options);
            return newMessage;
        } catch (error: unknown) {
            console.error(error);
            return message;
        }

    }
    
    console.error("Message is EMPTY");
    return message;
}