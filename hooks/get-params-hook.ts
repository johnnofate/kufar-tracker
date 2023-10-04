import { type Message } from 'node-telegram-bot-api'
import type TelegramBot from 'node-telegram-bot-api'
import * as interfaces from '../interfaces'
import { send } from './send-hook'

export async function getSearchParams (bot: TelegramBot, message: Message): Promise<interfaces.ISearchParams> {
  const searchParams: interfaces.ISearchParams = {
    [interfaces.searchParamsKeysEnum.category]: '',
    [interfaces.searchParamsKeysEnum.region]: '',
    [interfaces.searchParamsKeysEnum.model]: [],
    [interfaces.searchParamsKeysEnum.producer]: '',
    [interfaces.searchParamsKeysEnum.priceMin]: -1,
    [interfaces.searchParamsKeysEnum.priceMax]: Infinity,
    [interfaces.searchParamsKeysEnum.hasPhoto]: null,
    [interfaces.searchParamsKeysEnum.storage]: [],
    [interfaces.searchParamsKeysEnum.currentDate]: Date.now() - 120000,
    [interfaces.searchParamsKeysEnum.pageSize]: 200
  }

  const messageOptions = {
    reply_markup: {
      force_reply: true
    }
  }

  return await new Promise((resolve) => {
    const messageStorageHandler = (messageAnswer: Message): void => {
      const val: string = messageAnswer.text?.toLocaleLowerCase() ?? 'пусто'

      if (messageAnswer.text?.toLocaleLowerCase() !== 'пусто') {
        searchParams[interfaces.searchParamsKeysEnum.storage] = val.split(', ')
      }

      resolve(searchParams)
    }

    const messageHasPhotoHandler = (messageAnswer: Message): void => {
      const val: string = messageAnswer.text?.toLocaleLowerCase() ?? 'пусто'

      if (messageAnswer.text?.toLocaleLowerCase() !== 'пусто') {
        searchParams[interfaces.searchParamsKeysEnum.hasPhoto] = val.toUpperCase() === 'ДА'
      }

      send(bot, messageAnswer, interfaces.responseSuccessMessage.postStorage, messageOptions)
        .then(messageStorage => {
          bot.onReplyToMessage(message.chat.id, messageStorage.message_id, messageStorageHandler)
        })
        .catch(() => { })
    }

    const messagePriceMaxHandler = (messageAnswer: Message): void => {
      const val: string = messageAnswer.text?.toLocaleLowerCase() ?? 'пусто'

      if (val === 'пусто') {
        send(bot, messageAnswer, interfaces.responseSuccessMessage.postHasPhoto, messageOptions)
          .then(messageHasPhoto => {
            bot.onReplyToMessage(message.chat.id, messageHasPhoto.message_id, messageHasPhotoHandler)
          })
          .catch(() => { })
        return
      }

      if (Number(val) !== undefined && Number(val) !== null) {
        searchParams[interfaces.searchParamsKeysEnum.priceMax] = Number(val + '00')
      }
    }

    const messagePriceMinHandler = (messageAnswer: Message): void => {
      const val: string = messageAnswer.text?.toLocaleLowerCase() ?? 'пусто'

      if (val === 'пусто') {
        send(bot, messageAnswer, interfaces.responseSuccessMessage.postPriceMax, messageOptions)
          .then(messagePriceMax => {
            bot.onReplyToMessage(message.chat.id, messagePriceMax.message_id, messagePriceMaxHandler)
          })
          .catch(() => { })
      }

      if (Number(val) !== undefined && Number(val) !== null) {
        searchParams[interfaces.searchParamsKeysEnum.priceMin] = Number(val + '00')
      }
    }

    const messageProducerHandler = (messageAnswer: Message): void => {
      const val: string = messageAnswer.text?.toLocaleLowerCase() ?? 'пусто'

      if (messageAnswer.text?.toLocaleLowerCase() !== 'пусто') {
        searchParams[interfaces.searchParamsKeysEnum.producer] = val
      }

      send(bot, messageAnswer, interfaces.responseSuccessMessage.postPriceMin, messageOptions)
        .then(messagePriceMin => {
          bot.onReplyToMessage(message.chat.id, messagePriceMin.message_id, messagePriceMinHandler)
        })
        .catch(() => { })
    }

    const messageModelHandler = (messageAnswer: Message): void => {
      const val: string = messageAnswer.text?.toLocaleLowerCase() ?? 'пусто'

      if (messageAnswer.text?.toLocaleLowerCase() !== 'пусто') {
        searchParams[interfaces.searchParamsKeysEnum.model] = val.split(', ')
      }

      send(bot, messageAnswer, interfaces.responseSuccessMessage.postProducer, messageOptions)
        .then(messageProducer => {
          bot.onReplyToMessage(message.chat.id, messageProducer.message_id, messageProducerHandler)
        })
        .catch(() => { })
    }

    const messageRegionHandler = (messageAnswer: Message): void => {
      const val: string = messageAnswer.text?.toLocaleLowerCase() ?? 'пусто'

      if (messageAnswer.text?.toLocaleLowerCase() !== 'пусто') {
        searchParams[interfaces.searchParamsKeysEnum.region] = val
      }

      send(bot, messageAnswer, interfaces.responseSuccessMessage.postModel, messageOptions)
        .then(messageModel => {
          bot.onReplyToMessage(message.chat.id, messageModel.message_id, messageModelHandler)
        })
        .catch(() => { })
    }

    const messageCategoryHandler = (messageAnswer: Message): void => {
      const val: string = messageAnswer.text?.toLocaleLowerCase() ?? 'пусто'

      if (messageAnswer.text?.toLocaleLowerCase() !== 'пусто') {
        searchParams[interfaces.searchParamsKeysEnum.category] = val
      }

      send(bot, messageAnswer, interfaces.responseSuccessMessage.postRegion, messageOptions)
        .then(messageRegion => {
          bot.onReplyToMessage(message.chat.id, messageRegion.message_id, messageRegionHandler)
        })
        .catch(() => { })
    }

    send(bot, message, interfaces.responseSuccessMessage.postCategory, messageOptions)
      .then((messageCategory) => {
        bot.onReplyToMessage(message.chat.id, messageCategory.message_id, messageCategoryHandler)
      })
      .catch(() => { })
  })
}
