import MyService from "./MyService.js"
import { resourceGoodsAdd } from "./MyMysql/Index.js";

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

}

const resourceService = new ResourceService;

export default resourceService;