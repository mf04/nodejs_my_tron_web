import MyService from "./MyService.js"

class TronService extends MyService {

    constructor() {
        super();
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
        const amountTrx = await this.tronManager.swapBandwidthToTrx(resourceAmount);
        return await this.tronManager.delegateToOther(
            amountTrx, receiverAddress, rentTime, "BANDWIDTH"
        );
    }

    async resourceRecover() {
        return await this.tronManager.resourceRecover();
    }

    async trxTransfer(receiverAddress, amountTrx) {
        return await this.tronManager.trxTransfer(receiverAddress, amountTrx);
    }

    async usdtTransfer(receiverAddress, amountTrx) {
        return await this.tronManager.usdtTransfer(receiverAddress, amountTrx);
    }
}

const tronService = new TronService;

export default tronService;
