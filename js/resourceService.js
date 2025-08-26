import MyService from "./MyService.js"
import { resourceGoodsAdd, resourceGoodsGet } from "./MyMysql/Index.js";

class ResourceService extends MyService {

    constructor() {
        super();
    }

    async resourceGoodsAdd(titleCn, titleEn, titleKr, resourceType, price, unit, stock) {
        const res = await resourceGoodsAdd(
            titleCn, titleEn, titleKr, resourceType, price, unit, stock
        );
        return [res.insertId || -1];
    }

    async resourceGoodsGet(lang) {
        const titleMap = {
            "ko": "title_kr",
            "en": "title_en",
            "zh": "title_cn",
        };
        const title = titleMap[lang] || "title_kr";
        const field = `id, ${title} as title, resource_type as resourceType, price, unit, stock`;
        return await resourceGoodsGet(field);
    }
}

const resourceService = new ResourceService;

export default resourceService;