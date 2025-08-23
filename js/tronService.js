import TronResourceManager from "./TronResourceManager.js"
import { myPrivateKey3315 as myPrivateKey } from "./config.js"
// import { myPrivateKey3316 as myPrivateKey } from "./config.js"
// import { delegateToOtherExpireList } from "./MyMysql/Index.js"
// import RedisManager from "./MyRedis/RedisManager.js"
import { readPrivateKeyFile } from "./fsService.js"
// import cryptoService from "./cryptoService.js"

class TronService {
    constructor() {

        this.tronManager = null;
        this.init();

        // this.tronManager = new TronResourceManager(myPrivateKey);
    }

    async init() {
        // this.redis = new RedisManager;
        // const privateKey = await this.redis.getMyPrimaryKey();
        // this.tronManager = new TronResourceManager(privateKey);
        // const privateKeyEncry = await readPrivateKeyFile();
        // const privateKey = cryptoService.decrypt(privateKeyEncry);
        // console.log(privateKey);
        const privateKey = await readPrivateKeyFile();
        this.tronManager = new TronResourceManager(privateKey);
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
