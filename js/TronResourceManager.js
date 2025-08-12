import { TronWeb } from "tronweb"
import RedisManager from "./MyRedis/RedisManager.js"

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
        this.redis = new RedisManager;
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
            await this.redis.stakeForSelfItemPush(
                amountInSun, resourceType, this.ownerAddress, receipt.txid
            );
            return receipt;
        } catch (error) {
            console.error(`❌ 质押失败:`, error);
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
            return receipt;
        } catch (error) {
            console.error(`❌ 取消质押失败:`, error);
        }
    }

    /**
     * 
     * 将质押TRX产生的能量/带宽委托给其他账户。
     * 
     */
    async delegateToOther(amountInTrx, receiverAddress, resourceType = 'ENERGY') {
        if (!this.tronWeb.isAddress(receiverAddress)) {
            console.error("❌ 失败: 无效的接收者地址。");
            return;
        }
        try {
            const amountInSun = this.tronWeb.toSun(amountInTrx);
            const tx = await this.tronWeb.transactionBuilder.delegateResource(
                amountInSun, receiverAddress, resourceType, this.ownerAddress
            );
            const signedTx = await this.tronWeb.trx.sign(tx);
            const receipt = await this.tronWeb.trx.sendRawTransaction(signedTx);
            return receipt;
        } catch (error) {
            console.error(`❌ 委托失败:`, error);
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
            return receipt;
        } catch (error) {
            console.error(`❌ 取消委托失败:`, error);
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
                console.error(`❌ 取回失败:`, error);
            }
        }
    }
}

export default TronResourceManager;