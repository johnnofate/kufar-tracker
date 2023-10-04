import * as interfaces from '../interfaces'

export function dataHandler (data: interfaces.IKufarData, searchParams: interfaces.ISearchParams): interfaces.IDataHandlerResult {
  if (searchParams === undefined || searchParams === null) return { posts: [] }

  const result: interfaces.IResultPost[] = data.ads.reduce((posts: interfaces.IResultPost[], post: interfaces.IKufarPost): interfaces.IResultPost[] => {
    const title: string = post.subject
    const price: number = Number(post.priceByn)
    const postDate: number = new Date(post.listTime).getTime() ?? 0
    const hasPhoto: boolean = post.images.length > 0

    const accountParameters: interfaces.IKufarAccountParam[] = post.accountParameters
    const isCompony: boolean = !(accountParameters.filter((accountParam: interfaces.IKufarAccountParam) => {
      if ((accountParam.p === undefined) || (accountParam.v === undefined)) return false
      if (['shop_address', 'company_address', 'company_number'].includes(accountParam.p) && accountParam.v.length > 0) return true
      return false
    }).length === 0)

    const adParameters: interfaces.IKufarPostParam[] = post.adParameters
    const getParam = (filterParam: string): interfaces.IKufarPostParam[] => adParameters.filter((postParam: interfaces.IKufarPostParam) => postParam.p === filterParam)

    for (const key in searchParams) {
      if ((key === interfaces.searchParamsKeysEnum.currentDate) && searchParams[interfaces.searchParamsKeysEnum.currentDate] !== undefined) {
        if (postDate === 0) return posts

        if (postDate < searchParams[interfaces.searchParamsKeysEnum.currentDate]) return posts
      }
      if (isCompony) return posts
      if (key === interfaces.searchParamsKeysEnum.category && searchParams[interfaces.searchParamsKeysEnum.category] !== undefined) {
        const category: string | null | undefined = getParam('category').length > 0 ? getParam('category')[0].vl : null

        if (category === undefined || category === null) return posts
        if (!category.toUpperCase().includes(searchParams[interfaces.searchParamsKeysEnum.category].toUpperCase())) return posts
      }
      if (key === interfaces.searchParamsKeysEnum.region && searchParams[interfaces.searchParamsKeysEnum.region] !== undefined) {
        const region: string | null | undefined = getParam('region').length > 0 ? getParam('region')[0].vl : null

        if (region === undefined || region === null) return posts
        if (region.toUpperCase() !== searchParams[interfaces.searchParamsKeysEnum.region].toUpperCase()) return posts
      }
      if (key === interfaces.searchParamsKeysEnum.producer && searchParams[interfaces.searchParamsKeysEnum.producer] !== undefined) {
        const producer: string | null | undefined = getParam('phones_brand').length > 0 ? getParam('phones_brand')[0].vl : null

        if (producer === undefined || producer === null) return posts
        if (producer.toUpperCase() !== searchParams[interfaces.searchParamsKeysEnum.producer].toUpperCase()) return posts
      }
      if (key === interfaces.searchParamsKeysEnum.model && searchParams[interfaces.searchParamsKeysEnum.model] !== undefined && (searchParams[interfaces.searchParamsKeysEnum.model].length > 0)) {
        const model: string | null | undefined = getParam('phones_model').length > 0 ? getParam('phones_model')[0].vl : null

        if (model === undefined || model === null) return posts

        const candidate: string[] = searchParams[interfaces.searchParamsKeysEnum.model].filter((val: string) => {
          return model.toLowerCase().includes(val.toLowerCase())
        })

        if (candidate.length === 0) return posts
      }
      if (key === interfaces.searchParamsKeysEnum.priceMin && searchParams[interfaces.searchParamsKeysEnum.priceMin] !== undefined && searchParams[interfaces.searchParamsKeysEnum.priceMin] >= 0) {
        if (price === undefined || price === null) return posts
        if (price < searchParams[interfaces.searchParamsKeysEnum.priceMin]) return posts
      }
      if (key === interfaces.searchParamsKeysEnum.priceMax && searchParams[interfaces.searchParamsKeysEnum.priceMax] !== undefined && searchParams[interfaces.searchParamsKeysEnum.priceMax] < Infinity) {
        if (price === undefined || price === null) return posts
        if (price > searchParams[interfaces.searchParamsKeysEnum.priceMax]) return posts
      }
      if (key === interfaces.searchParamsKeysEnum.hasPhoto && searchParams[interfaces.searchParamsKeysEnum.hasPhoto] !== undefined) {
        if (searchParams[interfaces.searchParamsKeysEnum.hasPhoto] !== null) {
          if (hasPhoto !== searchParams[interfaces.searchParamsKeysEnum.hasPhoto]) return posts
        }
      }
      if (key === interfaces.searchParamsKeysEnum.storage && searchParams[interfaces.searchParamsKeysEnum.storage] !== undefined && (searchParams[interfaces.searchParamsKeysEnum.storage].length > 0)) {
        const storage: string | null | undefined = getParam('phablet_phones_memory').length > 0 ? getParam('phablet_phones_memory')[0].vl : null

        if (storage === null || storage === undefined) return posts

        const candidate = searchParams[interfaces.searchParamsKeysEnum.storage].filter((val: string) => {
          return storage.toLowerCase().includes(val.toLowerCase())
        })

        if (candidate.length === 0) return posts
      }
    }

    return [...posts, {
      title,
      price: price.toString(),
      imageLink: (post.images.length > 0) ? post.images[0].path : '',
      link: post.adLink
    }]
  }, [])

  return { posts: result }
}
