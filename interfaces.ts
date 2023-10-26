import type mongoose from 'mongoose'
import { type Message } from 'node-telegram-bot-api'

export enum searchParamsKeysEnum {
  category = 'category',
  region = 'region',
  model = 'model',
  producer = 'producer',
  price_min = 'price_min',
  price_max = 'price_max',
  has_photo = 'has_photo',
  storage = 'storage',
  current_date = 'current_date',
  page_size = 'page_size'
}

export interface ISearchParams {
  [searchParamsKeysEnum.category]?: string
  [searchParamsKeysEnum.region]?: string
  [searchParamsKeysEnum.model]?: string[]
  [searchParamsKeysEnum.producer]?: string
  [searchParamsKeysEnum.price_min]?: number
  [searchParamsKeysEnum.price_max]?: number
  [searchParamsKeysEnum.has_photo]?: boolean | null
  [searchParamsKeysEnum.storage]?: string[]
  [searchParamsKeysEnum.current_date]?: number
}

export interface IResultPost {
  title: string
  price: string
  imageLink: string
  link: string
}

export interface IResultPosts {
  searchParams: ISearchParams
  prevPosts: IResultPost[]
}

export type IClients = Record<number, IResultPosts | undefined>

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
  price_byn: string
  list_time: string
  images: IKufarPostImage[]
  account_parameters: IKufarAccountParam[]
  ad_parameters: IKufarPostParam[]
  ad_link: string
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
  somethingWentWrong: 'Что-то пошло не так',
  noAccess: 'У вас нет доступа к данному боту',
  noSearchParams: 'У вас нет подписок'
}

// MongoDb

export interface IMongoDBConnectResponse {
  state: boolean
  message: any
}

export interface IMongoDBLoginResponse {
  state: boolean
  message: any
}

export interface IMongoDBAddSearchParamsResponse {
  state: boolean
  message: any
}

export interface IMongoUser {
  _id: typeof mongoose.Schema.ObjectId
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string | undefined
  username?: string | undefined
  language_code?: string | undefined
  hasPremium: boolean
  login_date: Date
}
