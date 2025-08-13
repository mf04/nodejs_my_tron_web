import { TronWeb } from "tronweb"
// import RedisManager from "./MyRedis/RedisManager.js"
import { createStakeForSelf, createDelegateToOther } from "./MyMysql/Index.js"
// import TronStation from "tronstation"

class TronResourceManager {

    constructor(privateKey) {
        if (!privateKey) {
            throw new Error("必须提供私钥 (Private Key)！");
        }
        this.tronWeb = new TronWeb({
            // fullHost: 'https://api.shasta.trongrid.io',
            fullHost: 'https://nile.trongrid.io',
            privateKey,
        });
        this.ownerAddress = this.tronWeb.defaultAddress.base58;
        // this.redis = new RedisManager;
    }

    /**
     * 
     * 实时查询并计算当前波场网络上TRX与能量的兑换率。
     * 
     */
    async getEnergyExchangeRate() {
        try {
            const genesisAddress = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb';
            const accountResources = await this.tronWeb.trx.getAccountResources(genesisAddress);

            if (!accountResources || !('TotalEnergyLimit' in accountResources) || !('TotalEnergyWeight' in accountResources)) {
                console.error("未能从 getAccountResources 的返回结果中获取到必要的全网能量信息。返回结果:", accountResources);
                throw new Error("API返回格式可能已更改。");
            }

            const totalEnergyLimit = accountResources.TotalEnergyLimit;   // 每日网络产生的总能量
            const totalEnergyWeight = accountResources.TotalEnergyWeight; // 全网为获取能量而质押的TRX总数

            const energyPerTrx = totalEnergyLimit / totalEnergyWeight;
            const trxPerEnergy = totalEnergyWeight / totalEnergyLimit;

            return { energyPerTrx, trxPerEnergy }
        } catch (error) {
            console.error(`❌ 质押失败:`, error.message);
        }
    }

    /**
     * 
     * 
     * 能量兑换trx数量
     * 
     */
    async getAmountTrxByEnergy(amountEnergy) {
        const { trxPerEnergy } = await this.getEnergyExchangeRate();
        return trxPerEnergy * amountEnergy;
    }

    /**
     * 
     * 为自己质押TRX以获取能量或带宽。
     * 
     */
    async stakeForSelf(amountInTrx, resourceType = 'ENERGY') {
        try {
            const amountInSun = this.tronWeb.toSun(amountInTrx);
            const tx = await this.tronWeb.transactionBuilder.freezeBalanceV2(
                amountInSun, resourceType, this.ownerAddress
            );
            const signedTx = await this.tronWeb.trx.sign(tx);
            const receipt = await this.tronWeb.trx.sendRawTransaction(signedTx);
            // await this.redis.stakeForSelfItemPush(
            //     amountInSun, resourceType, this.ownerAddress, receipt.txid
            // );
            await createStakeForSelf(
                amountInTrx,
                resourceType,
                this.ownerAddress,
                receipt.txid,
            );
            return receipt;
        } catch (error) {
            console.error(`❌ 质押失败:`, error.message);
        }
    }

    /**
     * 
     * 为自己取消质押TRX。
     * 
     */
    async unstakeForSelf(amountInTrx, resourceType = 'ENERGY') {
        try {
            const amountInSun = this.tronWeb.toSun(amountInTrx);
            const tx = await this.tronWeb.transactionBuilder.unfreezeBalanceV2(
                amountInSun, resourceType, this.ownerAddress
            );
            const signedTx = await this.tronWeb.trx.sign(tx);
            const receipt = await this.tronWeb.trx.sendRawTransaction(signedTx);
            await createStakeForSelf(
                amountInTrx,
                resourceType,
                this.ownerAddress,
                receipt.txid,
                2,
            );
            return receipt;
        } catch (error) {
            console.error(`❌ 取消质押失败:`, error.message);
        }
    }

    /**
     * 
     * 将质押TRX产生的能量/带宽委托给其他账户。
     * 
     */
    async delegateToOther(amountInTrx, receiverAddress, delegateTime, resourceType = 'ENERGY') {
        if (!this.tronWeb.isAddress(receiverAddress)) {
            console.error("❌ 失败: 无效的接收者地址。");
            return;
        }
        try {
            // console.log(amountInTrx);
            const amountInSun = this.tronWeb.toSun(amountInTrx);
            // console.log(amountInSun);
            const amountSunInteger = Math.ceil(amountInSun);
            // console.log(amountSunInteger);
            const tx = await this.tronWeb.transactionBuilder.delegateResource(
                amountSunInteger, receiverAddress, resourceType, this.ownerAddress
            );
            const signedTx = await this.tronWeb.trx.sign(tx);
            const receipt = await this.tronWeb.trx.sendRawTransaction(signedTx);
            const currentTime = +new Date();
            const delegateDeadline = currentTime + delegateTime * 1000;
            const delegateDeadlineDate = new Date(delegateDeadline);
            // console.log(delegateDeadlineDate);
            await createDelegateToOther(
                amountInTrx,
                resourceType,
                this.ownerAddress,
                receiverAddress,
                receipt.txid,
                1,
                delegateTime,
                delegateDeadlineDate,
            );
            return receipt;
        } catch (error) {
            console.error(`❌ 委托失败:`, error.message);
        }
    }

    /**
     * 
     * 取消对其他账户的能量/带宽委托。
     * 
     */
    async undelegateFromOther(amountInTrx, receiverAddress, resourceType = 'ENERGY') {
        if (!this.tronWeb.isAddress(receiverAddress)) {
            console.error("❌ 失败: 无效的接收者地址。");
            return;
        }
        try {
            const amountInSun = this.tronWeb.toSun(amountInTrx);
            const tx = await this.tronWeb.transactionBuilder.undelegateResource(
                amountInSun, receiverAddress, resourceType, this.ownerAddress
            );
            const signedTx = await this.tronWeb.trx.sign(tx);
            const receipt = await this.tronWeb.trx.sendRawTransaction(signedTx);
            await createDelegateToOther(
                amountInTrx,
                resourceType,
                this.ownerAddress,
                receiverAddress,
                receipt.txid,
                2,
            );
            return receipt;
        } catch (error) {
            console.error(`❌ 取消委托失败:`, error.message);
        }
    }

    /**
     * 
     * 自动检查并取回所有已到期、处于解冻状态的TRX。
     * 
     */
    async withdrawExpiredBalance() {
        try {
            const accountData = await this.tronWeb.trx.getAccount(this.ownerAddress);
            if (!accountData.unfrozenV2 || accountData.unfrozenV2.length === 0) {
                console.log("   ℹ️  未发现任何处于解冻中的TRX。无需操作。");
                return;
            }
            const now = Date.now();
            const canWithdraw = accountData.unfrozenV2.some(
                entry => entry.unfreeze_expire_time <= now
            );
            if (!canWithdraw) {
                console.log("   ℹ️  有待解冻的TRX，但它们的14天锁定期尚未结束。");
                return;
            }
            const tx = await this.tronWeb.transactionBuilder.withdrawExpireUnfreeze(this.ownerAddress);
            const signedTx = await this.tronWeb.trx.sign(tx);
            const receipt = await this.tronWeb.trx.sendRawTransaction(signedTx);
            return receipt;
        } catch (error) {
            if (error.toString().includes("no withdrawable TRX")) {
                console.log("   ℹ️  API确认：当前没有可供领取的TRX。");
            } else {
                console.error(`❌ 取回失败:`, error.message);
            }
        }
    }
}

export default TronResourceManager;