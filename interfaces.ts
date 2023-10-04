import { type Message } from 'node-telegram-bot-api'

export enum searchParamsKeysEnum {
  category = 'category',
  region = 'region',
  model = 'model',
  producer = 'producer',
  priceMin = 'priceMin',
  priceMax = 'priceMax',
  hasPhoto = 'hasPhoto',
  storage = 'storage',
  currentDate = 'currentDate',
  pageSize = 'pageSize'
}

export interface ISearchParams {
  [searchParamsKeysEnum.category]?: string
  [searchParamsKeysEnum.region]?: string
  [searchParamsKeysEnum.model]?: string[]
  [searchParamsKeysEnum.producer]?: string
  [searchParamsKeysEnum.priceMin]?: number
  [searchParamsKeysEnum.priceMax]?: number
  [searchParamsKeysEnum.hasPhoto]?: boolean | null
  [searchParamsKeysEnum.storage]?: string[]
  [searchParamsKeysEnum.currentDate]?: number
  [searchParamsKeysEnum.pageSize]?: number
}

export interface IResultPost {
  title: string
  price: string
  imageLink: string
  link: string
}

export interface IDataHandlerResult {
  posts: IResultPost[]
}

export interface IResult {
  posts: IResultPost[] | null
  error: string | null
}

export interface IKufarPostParam {
  p?: string
  vl?: string
}

export interface IKufarPostImage {
  path: string
}

export interface IKufarAccountParam {
  p?: string
  v?: string
}

export interface IKufarPost {
  subject: string
  priceByn: string
  listTime: string
  images: IKufarPostImage[]
  accountParameters: IKufarAccountParam[]
  adParameters: IKufarPostParam[]
  adLink: string
}

export interface IKufarData {
  ads: IKufarPost[]
}

// Telegram Bot

export const commands = ['/start', '/sub', '/unsub']

export enum commandsEnum {
  start = '/start',
  subscribe = '/sub',
  unsubscribe = '/unsub'
}

export const responseSuccessMessage = {
  start: (message: Message): string => `Привет, ${message.from?.first_name ?? 'друг'}!`,
  subscribeInfo: 'Чтобы подписаться на объявления Куфар, вам нужно заполнить небольшую форму. Отвечайте на сообщения с помощью поля "Ответить". Чтобы пропустить пункт напишите "пусто".',
  subscribeSuccess: 'Вы успешно подписаны на новые объявления по данным параметрам!',
  unsubscribeSuccess: 'Вы успешно отписались!',
  postCategory: 'Какая будет категория?',
  postRegion: 'Какой будет город?',
  postModel: 'Какая модель? (Можно несколько, указываете модели через запятую с одним пробелом)',
  postProducer: 'Какой будет производитель?',
  postPriceMin: 'Какая будет минимальная цена?',
  postPriceMax: 'Какая будет максимальная цена?',
  postHasPhoto: 'Будет ли фото у объявления? (да, нет)',
  postStorage: 'Сколько памяти? (Можно несколько, указываете память через запятую с одним пробелом)',
  alreadySubscribed: 'Вы уже подписаны.',
  botRestart: 'Бот был перезапущен, если вы не находитесь в списке премиум пользователей, то подпишитесь заново.'
}

export const responseErrorMessage = {
  indefiniteCommand: 'Такой команды не существует',
  somethingWentWrong: 'Что-то пошло не так'
}

export interface IClient {
  searchParams: ISearchParams
  prevPosts: IResultPost[]
}

export type IClients = Record<string, IClient | undefined>
