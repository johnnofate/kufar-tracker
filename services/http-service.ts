import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type * as interfaces from '../interfaces'
import config from 'config'
import { dataHandler } from '../hooks/handle-http-data-hook'

export class HttpService {
  private readonly KUFAR_API_URL: string = config.get('KUFAR_API_URL')

  public async getKufarPosts (searchParams: interfaces.ISearchParams): Promise<interfaces.IResult | undefined> {
    if (searchParams === undefined || searchParams === null) return
    if (searchParams.category === undefined || searchParams.category === null) return

    const cat: number = searchParams.category.toLowerCase().includes('телефон') ? 17010 : 0

    const options: AxiosRequestConfig = {
      headers: {
        Accept: 'application/json'
      }
    }

    let url: string = ''

    if (cat === 0) {
      url = this.KUFAR_API_URL + `&size=${searchParams.pageSize}`
    } else {
      url = this.KUFAR_API_URL + `&cat=${cat}&size=${searchParams.pageSize}`
    }

    try {
      const { data, status }: AxiosResponse<interfaces.IKufarData, number> = await axios
        .get(url, options)
        .catch((err) => { console.log(err); return err })

      if (status === 200) {
        const { posts }: interfaces.IDataHandlerResult = dataHandler(data, searchParams)

        return { posts, error: null }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.log('error message: ', error.message)
        return { posts: null, error: error.message }
      } else {
        console.log('unexpected error: ', error)
        return { posts: null, error: 'An unexpected error occurred' }
      }
    }
  }
}
