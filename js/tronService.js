import TronResourceManager from "./TronResourceManager.js"
import { myPrivateKey3315 as myPrivateKey } from "./config.js"

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

    async delegateToOther(amountTrx, receiverAddress, resourceType) {
        return await this.tronManager.delegateToOther(amountTrx, receiverAddress, resourceType)
    }

    async undelegateFromOther(amountTrx, receiverAddress, resourceType) {
        return await this.tronManager.undelegateFromOther(amountTrx, receiverAddress, resourceType)
    }

    async withdrawExpiredBalance() {
        return await this.tronManager.withdrawExpiredBalance()
    }
}

const tronService = new TronService;

export default tronService;
