import { type Message } from 'node-telegram-bot-api'
import type TelegramBot from 'node-telegram-bot-api'
import * as interfaces from '../interfaces'
import { getSearchParams } from './get-params-hook'
import { send } from './send-hook'
import type { MongoDB } from '../services/mongo-service'

export let isReply: boolean = false

export async function handleMessages (bot: TelegramBot, message: Message, clients: interfaces.IClients, mongoService: MongoDB): Promise<interfaces.ISearchParams | undefined> {
  const includesCommand = interfaces.commands.filter((command: string) => {
    return command === message.text
  })

  if (includesCommand.length <= 0 && !isReply) {
    console.log(isReply)
    await send(bot, message, interfaces.responseErrorMessage.indefiniteCommand)
  }

  switch (message.text) {
    case interfaces.commandsEnum.start:
      await send(bot, message, interfaces.responseSuccessMessage.start(message))
      break
    case interfaces.commandsEnum.subscribe: {
      if (Object.keys(clients[message.chat.id] ?? {}).length > 0) {
        await send(bot, message, interfaces.responseSuccessMessage.alreadySubscribed)
        return
      }

      await send(bot, message, interfaces.responseSuccessMessage.subscribeInfo)
      isReply = true

      const searchParams: interfaces.ISearchParams = await getSearchParams(bot, message)
      await send(bot, message, interfaces.responseSuccessMessage.subscribeSuccess)

      setTimeout(() => {
        isReply = false
      })

      return searchParams
    }
    case interfaces.commandsEnum.unsubscribe: {
      clients[message.chat.id] = undefined
      const unsubscribeResult: interfaces.IMongoDBAddSearchParamsResponse = await mongoService.removeSearchParams(message.chat.id)
      await send(bot, message, unsubscribeResult.message)
      break
    }
    default:
      break
  }
}
