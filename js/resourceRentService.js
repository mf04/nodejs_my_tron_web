import MyService from "./MyService.js";
import priceService from "./priceService.js";
import { generateOrderNumber } from "./util.js";
import {
    preRentDelegate,
    getMyResourceRentList,
} from "./MyMysql/Index.js";

class ResourceRentService extends MyService {

    constructor() {
        super();
    }

    async resourceRentEvent(params) {
        try {
            const {
                userId, resourceAmount, resourceType,
                rentTime, receiverAddress, maxWaitTime,
            } = params;
            const price = await priceService.getBuyResourcePrice(
                resourceType, resourceAmount, rentTime);
            const ownerAddress = this.getMainAccount();
            const orderNum = generateOrderNumber();
            // delegateStatus { 1:代理, 2:取消代理 }
            const delegateStatus = 1;
            const currentTime = +new Date();
            const processDeadLine = currentTime + maxWaitTime * 1000;
            const processDeadLineFormat = new Date(processDeadLine);
            const result = await preRentDelegate([
                userId, resourceAmount, resourceType, ownerAddress, receiverAddress,
                delegateStatus, rentTime, maxWaitTime, processDeadLineFormat,
                price, orderNum
            ]);
            return [result.insertId];
        } catch (error) {
            return [`Delegate failed: ${error.message}`, "fail"];
        }
    }

    async resourceRentMultiEvent(paramsArr, userId) {
        paramsArr = paramsArr.map(item => {
            item.userId = userId;
            return item;
        })
        for (let i = 0, item; item = paramsArr[i++];) {
            await resourceRentEvent(item);
        }
        return paramsArr;
    }

    async getMyResourceRentList(userId) {
        return await getMyResourceRentList(userId);
    }

}

const resourceRentService = new ResourceRentService;

export default resourceRentService;