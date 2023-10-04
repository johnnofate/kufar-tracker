import { type Message } from 'node-telegram-bot-api'
import type TelegramBot from 'node-telegram-bot-api'

export async function send (
  bot: TelegramBot,
  message: Message,
  text: string,
  options: TelegramBot.SendMessageOptions = {}
): Promise<TelegramBot.Message> {
  try {
    const newMessage = await bot.sendMessage(message.chat.id, text, options)
    return newMessage
  } catch (error: unknown) {
    console.error(error)
    return message
  }
}
