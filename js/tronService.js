import MyService from "./MyService.js"
import userService from "./userService.js"

class TronService extends MyService {

    constructor() {
        super();
    }

    getMainAccount() {
        return this.tronManager.ownerAddress;
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

    async energyRent(userId, resourceAmount, rentTime, receiverAddress, maxWaitTime, price) {
        const amountTrx = await this.tronManager.swapEnergyToTrx(resourceAmount);
        const isBalanceSuff = await userService.userBalanceVerify(userId, price);
        if (!isBalanceSuff) {
            return ["Insufficient balance.", "fail"];
        }
        const hash = await this.tronManager.delegateToOtherV2(amountTrx, receiverAddress, "ENERGY");
        console.log(hash);
        return [hash];
    }

    async bandwidthRent(userId, resourceAmount, rentTime, receiverAddress, maxWaitTime, price) {
        const amountTrx = await this.tronManager.swapBandwidthToTrx(resourceAmount);
        const _amountTrx = this.tronManager.tronWeb.toSun(amountTrx);
        console.log(amountTrx, _amountTrx);
        return [amountTrx];
        // return await this.tronManager.delegateToOther(
        //     amountTrx, receiverAddress, rentTime, "BANDWIDTH"
        // );
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
