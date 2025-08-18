import TronResourceManager from "./TronResourceManager.js"
import { myPrivateKey3315 as myPrivateKey } from "./config.js"
// import { myPrivateKey3316 as myPrivateKey } from "./config.js"
// import { delegateToOtherExpireList } from "./MyMysql/Index.js"

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
        // return [resourceAmount, rentTime, receiverAddress, 3314];
        // return await this.tronManager.delegateToOther(
        //     1, receiverAddress, rentTime, "BANDWIDTH"
        // );
        const amountTrx = await this.tronManager.swapBandwidthToTrx(resourceAmount);
        // console.log(amountTrx);
        // return [amountTrx];
        return await this.tronManager.delegateToOther(
            amountTrx, receiverAddress, rentTime, "BANDWIDTH"
        );
    }

    async resourceRecover() {
        return await this.tronManager.resourceRecover();
    }
}

const tronService = new TronService;

export default tronService;
