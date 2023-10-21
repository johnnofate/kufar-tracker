import { type Message } from 'node-telegram-bot-api'
import type TelegramBot from 'node-telegram-bot-api'
import * as interfaces from '../interfaces'
import { getSearchParams } from './get-params-hook'
import { send } from './send-hook'

export let isReply: boolean = false

export async function handleMessages (bot: TelegramBot, message: Message, clients: interfaces.IClients): Promise<interfaces.ISearchParams | undefined> {
  const includesCommand = interfaces.commands.filter((command: string) => {
    return command === message.text
  })

  if (includesCommand.length <= 0 && !isReply) {
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
      isReply = false

      await send(bot, message, interfaces.responseSuccessMessage.subscribeSuccess)

      return searchParams
    }
    case interfaces.commandsEnum.unsubscribe:
      clients[message.chat.id] = undefined
      await send(bot, message, interfaces.responseSuccessMessage.unsubscribeSuccess)
      break
    default:
      break
  }
}
