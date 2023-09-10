import * as interfaces from "../interfaces";

export function dataHandler(data: interfaces.IKufarData, searchParams: interfaces.ISearchParams): interfaces.IDataHandlerResult {
    const result: interfaces.IResultPost[] = data["ads"].reduce((posts: interfaces.IResultPost[], post: interfaces.IKufarPost): interfaces.IResultPost[] => {
        const title: string = post["subject"];
        const price: number = Number(post["price_byn"]);
        const post_date: number = new Date(post["list_time"]).getTime();
        const has_photo: boolean = post["images"].length > 0;

        const ad_parameters: interfaces.IKufarPostParam[] = post["ad_parameters"];
        const getParam = (filterParam: string): interfaces.IKufarPostParam[] => ad_parameters.filter((postParam: interfaces.IKufarPostParam) => postParam["p"] === filterParam);

        for (const key in searchParams) {
            if (key === interfaces.searchParamsKeysEnum.title && searchParams[interfaces.searchParamsKeysEnum.title]) {
                if (!title.length) return posts;
                if (!title.toUpperCase().includes(searchParams[interfaces.searchParamsKeysEnum.title].toUpperCase())) return posts;
            }
            if (key === interfaces.searchParamsKeysEnum.category && searchParams[interfaces.searchParamsKeysEnum.category]) {
                const category: string | null = (getParam("category") && getParam("category")[0]) ? getParam("category")[0]["vl"] : null;

                if (!category) return posts;
                if (!category.toUpperCase().includes(searchParams[interfaces.searchParamsKeysEnum.category].toUpperCase())) return posts;
            }
            if (key === interfaces.searchParamsKeysEnum.region && searchParams[interfaces.searchParamsKeysEnum.region]) {
                const region: string | null = (getParam("region") && getParam("region")[0]) ? getParam("region")[0]["vl"] : null;

                if (!region) return posts;
                if (region.toUpperCase() !== searchParams[interfaces.searchParamsKeysEnum.region].toUpperCase()) return posts;
            }
            if (key === interfaces.searchParamsKeysEnum.producer && searchParams[interfaces.searchParamsKeysEnum.producer]) {
                const producer: string | null = (getParam("phones_brand") && getParam("phones_brand")[0]) ? getParam("phones_brand")[0]["vl"] : null;

                if (!producer) return posts;
                if (producer.toUpperCase() !== searchParams[interfaces.searchParamsKeysEnum.producer].toUpperCase()) return posts;
            }
            if (key === interfaces.searchParamsKeysEnum.model && searchParams[interfaces.searchParamsKeysEnum.model].length) {
                const model: string | null = (getParam("phones_model") && getParam("phones_model")[0]) ? getParam("phones_model")[0]["vl"] : null;

                if (!model) return posts;

                const candidate: string[] = searchParams[interfaces.searchParamsKeysEnum.model].filter((val: string) => {
                    return model.toLowerCase().includes(val.toLowerCase());
                });

                if (!candidate.length) return posts;
            }
            if (key === interfaces.searchParamsKeysEnum.price_min && searchParams[interfaces.searchParamsKeysEnum.price_min] >= 0) {
                if (!price) return posts;
                if (price < searchParams[interfaces.searchParamsKeysEnum.price_min]) return posts;
            }
            if (key === interfaces.searchParamsKeysEnum.price_max && searchParams[interfaces.searchParamsKeysEnum.price_max] < Infinity) {
                if (!price) return posts; posts;
                if (price > searchParams[interfaces.searchParamsKeysEnum.price_max]) return posts;
            }
            if (key === interfaces.searchParamsKeysEnum.has_photo && searchParams[interfaces.searchParamsKeysEnum.has_photo]) {
                if (searchParams[interfaces.searchParamsKeysEnum.has_photo] !== null) {
                    if (has_photo !== searchParams[interfaces.searchParamsKeysEnum.has_photo]) return posts;
                }
            }
            if (key === interfaces.searchParamsKeysEnum.storage && searchParams[interfaces.searchParamsKeysEnum.storage].length) {
                const storage: string | null = (getParam("phablet_phones_memory") && getParam("phablet_phones_memory")[0]) ? getParam("phablet_phones_memory")[0]["vl"] : null;

                if (!storage) return posts;

                const candidate = searchParams[interfaces.searchParamsKeysEnum.storage].filter((val: string) => {
                    return storage.toLowerCase().includes(val.toLowerCase());
                });

                if (!candidate.length) return posts;
            }
            if (key === interfaces.searchParamsKeysEnum.area && searchParams[interfaces.searchParamsKeysEnum.area]) {
                const area: string | null = (getParam("area") && getParam("area")[0]) ? getParam("area")[0]["vl"] : null;

                if (!area) return posts;
                if (!area.toUpperCase().includes(searchParams[interfaces.searchParamsKeysEnum.area].toUpperCase())) return posts;
            }
            if ((key === interfaces.searchParamsKeysEnum.current_date) && !!searchParams[interfaces.searchParamsKeysEnum.current_date]) {
                if (!post_date) return posts;

                if (post_date < searchParams[interfaces.searchParamsKeysEnum.current_date]) return posts;
            }
        }

        return [...posts, {
            title,
            price: price.toString(),
            link: post["ad_link"]
        }];
    }, []);

    return { posts: result };
}