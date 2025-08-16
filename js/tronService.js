import TronResourceManager from "./TronResourceManager.js"
import { myPrivateKey3315 as myPrivateKey } from "./config.js"
// import { myPrivateKey3316 as myPrivateKey } from "./config.js"
import { delegateToOtherExpireList } from "./MyMysql/Index.js"

class TronService {
    constructor() {
        this.tronManager = new TronResourceManager(myPrivateKey);
    }

    async stakeForSelf(amountTrx, resourceType) {
        return await this.tronManager.stakeForSelf(amountTrx, resourceType)
    }

    async unstakeForSelf(amountTrx, resourceType) {
        return await this.tronManager.unstakeForSelf(amountTrx, resourceType)
    }

    async delegateToOther(amountTrx, receiverAddress, delegateTime, resourceType) {
        return await this.tronManager.delegateToOther(amountTrx, receiverAddress, delegateTime, resourceType)
    }

    async undelegateFromOther(amountTrx, receiverAddress, resourceType) {
        return await this.tronManager.undelegateFromOther(amountTrx, receiverAddress, resourceType)
    }

    async withdrawExpiredBalance() {
        return await this.tronManager.withdrawExpiredBalance()
    }

    async getEnergyExchangeRate() {
        return await this.tronManager.getEnergyExchangeRate();
    }

    async energyRent(resourceAmount, rentTime, receiverAddress) {
        const amountTrx = await this.tronManager.swapEnergyToTrx(resourceAmount);
        return await this.tronManager.delegateToOther(
            amountTrx, receiverAddress, rentTime, "ENERGY"
        );
    }

    async bandwidthRent(resourceAmount, rentTime, receiverAddress) {
        // const amountTrx = await this.tronManager.swapBandwidthToTrx(resourceAmount);
        return [3314];
    }

    async resourceRecover() {
        try {
            const result = await delegateToOtherExpireList();
            if (!result || !result.length) {
                throw new Error("没有到期的租赁记录");
            }
            for (let i = 0, item; item = result[i++];) {
                const { amount, receiver_address, resource_type } = item;
                const amountTrx = amount / (10 ** 6);
                await this.tronManager.undelegateFromOther(amountTrx, receiver_address, resource_type);
            }
            return [true];
        } catch (error) {
            return [error.message, "fail"];
        }
    }
}

const tronService = new TronService;

export default tronService;
