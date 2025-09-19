import { TronWeb } from "tronweb"
// import RedisManager from "./MyRedis/RedisManager.js"
import {
    createStakeForSelf,
    createDelegateToOtherV2,
    // delegateToOtherExpireList,
} from "./MyMysql/Index.js"
import axios from "axios";
import { TRONGRID_API_URL, USDT_CONTRACT } from "./config.js"
import { formattedValue } from "./bigNumber.util.js"
import * as resourceRentFunc from "./resourceRentFunc.js";
import * as resourceRentRecoverFunc from "./resourceRentRecoverFunc.js";
import * as userWithdrawFunc from "./userWithdrawFunc.js";
import * as userRechargeFunc from "./userRechargeFunc.js";

class TronResourceManager {

    constructor(privateKey) {
        if (!privateKey) {
            throw new Error("必须提供私钥 (Private Key)！");
        }
        this.privateKey = privateKey;
        this.tronWeb = new TronWeb({
            // fullHost: 'https://api.shasta.trongrid.io',
            fullHost: TRONGRID_API_URL,
            privateKey,
        });
        this.ownerAddress = this.tronWeb.defaultAddress.base58;
        // this.redis = new RedisManager;
    }

    getBase58Address(hexAddress) {
        return this.tronWeb.address.fromHex(hexAddress);
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
            return error.message;
        }
    }

    /**
     * 
     * 
     * 能量兑换trx
     * 
     */
    async swapEnergyToTrx(amountEnergy) {
        const { trxPerEnergy } = await this.getEnergyExchangeRate();
        const _trx = trxPerEnergy * amountEnergy;
        const _trxDecimal = formattedValue(_trx);
        // console.log(trxPerEnergy, amountEnergy, _trx, _trxDecimal);
        return _trxDecimal;
    }

    /**
     * 
     * 
     * trx兑换能量
     * 
     */
    async swapTrxToEnergy(amountTrx) {
        const { energyPerTrx } = await this.getEnergyExchangeRate();
        return energyPerTrx * amountTrx;
    }

    /**
     * 
     * 实时查询并计算当前波场网络上TRX与带宽的兑换率。
     * 
     */
    async getBandwidthExchangeRate() {
        const TOTAL_BANDWIDTH_POINTS = 43200000000;
        const URL = TRONGRID_API_URL + "/wallet/getaccountresource";
        const DUMMY_POST_DATA = { address: this.ownerAddress, visible: true };
        const response = await axios.post(URL, DUMMY_POST_DATA);
        if (response.status !== 200 || !response.data) {
            throw new Error('从 TronGrid API 获取网络数据失败，未收到有效响应。');
        }
        const networkData = response.data;
        const totalStakedForBandwidthTrx = networkData.TotalNetWeight;
        if (typeof totalStakedForBandwidthTrx === 'undefined') {
            throw new Error('无法从API响应中检索到总质押TRX数据。');
        }
        return TOTAL_BANDWIDTH_POINTS / totalStakedForBandwidthTrx;
    }

    /**
     * 
     * 带宽兑换trx
     * 
     */
    async swapBandwidthToTrx(amountBandwidth) {
        const rate = await this.getBandwidthExchangeRate();
        const _trx = amountBandwidth / rate;
        const _trxDecimal = formattedValue(_trx);
        // console.log(amountBandwidth, rate, _trx, _trxDecimal);
        return _trxDecimal;
    }

    /**
     * 
     * trx兑换带宽
     * 
     */
    async swapTrxToBandWidth(amountTrx) {
        const { trxPerBandwidth } = this.getBandwidthExchangeRate();
        return trxPerBandwidth * amountTrx;
    }

    /**
     * 
     * trx兑换带宽
     * 
     */
    async swapTrxToBandwidth(amountTrx) {

    }

    contractExcuteValidate(receipt) {
        if (receipt && receipt.code == "CONTRACT_VALIDATE_ERROR") {
            throw new Error("CONTRACT_VALIDATE_ERROR");
        }
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
            this.contractExcuteValidate(receipt);
            await createStakeForSelf(
                amountInTrx,
                resourceType,
                this.ownerAddress,
                receipt.txid,
                1,
            );
            return [receipt.txid];
        } catch (error) {
            return [`质押失败: ${error.message}`, "fail"];
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
            this.contractExcuteValidate(receipt);
            await createStakeForSelf(
                amountInTrx,
                resourceType,
                this.ownerAddress,
                receipt.txid,
                2,
            );
            return [receipt.txid];
        } catch (error) {
            return [`取消质押失败: ${error.message}`, "fail"];
        }
    }

    /**
     * 
     * 将质押TRX产生的能量/带宽委托给其他账户。
     * 
     */
    async delegateToOther(amountInTrx, receiverAddress, delegateTime, resourceType = 'ENERGY') {
        if (!this.tronWeb.isAddress(receiverAddress)) {
            throw new Error("失败: 无效的接收者地址。");
        }
        try {
            const amountInSun = this.tronWeb.toSun(amountInTrx);
            const amountSunInteger = Math.ceil(amountInSun);
            const tx = await this.tronWeb.transactionBuilder.delegateResource(
                amountSunInteger, receiverAddress, resourceType, this.ownerAddress
            );
            const signedTx = await this.tronWeb.trx.sign(tx);
            const receipt = await this.tronWeb.trx.sendRawTransaction(signedTx);
            this.contractExcuteValidate(receipt);
            const currentTime = +new Date();
            const delegateDeadline = currentTime + delegateTime * 1000;
            const delegateDeadlineDate = new Date(delegateDeadline);
            await createDelegateToOther(
                amountSunInteger,
                resourceType,
                this.ownerAddress,
                receiverAddress,
                receipt.txid,
                1,
                delegateTime,
                delegateDeadlineDate,
            );
            return [receipt.txid];
        } catch (error) {
            return [`委托失败: ${error.message}`, "fail"];
        }
    }

    async delegateToOtherV2(amountInTrx, receiverAddress, resourceType) {
        try {
            if (!this.tronWeb.isAddress(receiverAddress)) {
                throw new Error("失败: 无效的接收者地址。");
            }
            const amountInSun = this.tronWeb.toSun(amountInTrx);
            const amountSunInteger = Math.ceil(amountInSun);
            const tx = await this.tronWeb.transactionBuilder.delegateResource(
                amountSunInteger, receiverAddress, resourceType, this.ownerAddress
            );
            const signedTx = await this.tronWeb.trx.sign(tx);
            const receipt = await this.tronWeb.trx.sendRawTransaction(signedTx);
            this.contractExcuteValidate(receipt);
            return receipt.txid;
        } catch (error) {
            return [`委托失败: ${error.message}`, "fail"];
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
                throw new Error("未发现任何处于解冻中的TRX, 无需操作。");
            }
            const now = Date.now();
            const canWithdraw = accountData.unfrozenV2.some(
                entry => entry.unfreeze_expire_time <= now
            );
            if (!canWithdraw) {
                throw new Error("有待解冻的TRX, 但它们的14天锁定期尚未结束。");
            }
            const unfrozenV2Filter = accountData.unfrozenV2.filter(
                entry => entry.unfreeze_expire_time <= now
            );
            let retTxid = [];
            unfrozenV2Filter.map(async unfrozenV2Item => {
                const tx = await this.tronWeb.transactionBuilder.withdrawExpireUnfreeze(
                    this.ownerAddress
                );
                const signedTx = await this.tronWeb.trx.sign(tx);
                const receipt = await this.tronWeb.trx.sendRawTransaction(signedTx);
                const amountInTrx = this.tronWeb.fromSun(unfrozenV2Item.unfreeze_amount);
                const resourceType = unfrozenV2Item.type;
                await createStakeForSelf(
                    amountInTrx,
                    resourceType,
                    this.ownerAddress,
                    receipt.txid,
                    3,
                );
                retTxid.push(receipt.txid);
            });
            return [retTxid];
        } catch (error) {
            return [error.message, "fail"];
        }
    }

    /**
     * 
     * 取消对其他账户的能量/带宽委托。
     * 
     */
    async undelegateFromOther(delegateItem) {
        const {
            id, user_id, amount, resource_type, owner_address,
            receiver_address, delegate_time, delegate_deadline, max_wait_time, price,
            order_num
        } = delegateItem;
        if (!this.tronWeb.isAddress(receiver_address)) {
            throw new Error("失败: 无效的接收者地址。");
        }
        try {
            const amountInSun = this.tronWeb.toSun(amount);
            // console.log("-----amountInSun----");
            // console.log(amountInSun);
            const tx = await this.tronWeb.transactionBuilder.undelegateResource(
                amountInSun, receiver_address, resource_type, owner_address
            );
            // console.log("-----tx----");
            // console.log(tx);
            const signedTx = await this.tronWeb.trx.sign(tx);
            // console.log("-----signedTx----");
            // console.log(signedTx);
            const receipt = await this.tronWeb.trx.sendRawTransaction(signedTx);
            // console.log("-----receipt----");
            // console.log(receipt);
            this.contractExcuteValidate(receipt);
            const params = [
                user_id, amount, resource_type, owner_address, receiver_address,
                receipt.txid, 2, delegate_time, delegate_deadline, max_wait_time,
                price, order_num, id
            ];
            // console.log("-----params----");
            // console.log(params);
            await createDelegateToOtherV2(params);
            return [receipt.txid];
        } catch (error) {
            return [`取消委托失败: ${error.message}`, "fail"];
        }
    }

    // async undelegateFromOther(amount, receiverAddress, resourceType = 'ENERGY', isSunTrx = false, fromPk = null) {
    //     if (!this.tronWeb.isAddress(receiverAddress)) {
    //         throw new Error("失败: 无效的接收者地址。");
    //     }
    //     try {
    //         let amountInSun = amount;
    //         if (!isSunTrx) {
    //             amountInSun = this.tronWeb.toSun(amount);
    //         }
    //         const tx = await this.tronWeb.transactionBuilder.undelegateResource(
    //             amountInSun, receiverAddress, resourceType, this.ownerAddress
    //         );
    //         const signedTx = await this.tronWeb.trx.sign(tx);
    //         const receipt = await this.tronWeb.trx.sendRawTransaction(signedTx);
    //         this.contractExcuteValidate(receipt);
    //         await createDelegateToOther(
    //             amountInSun,
    //             resourceType,
    //             this.ownerAddress,
    //             receiverAddress,
    //             receipt.txid,
    //             2,
    //             null,
    //             null,
    //             fromPk,
    //         );
    //         return [receipt.txid];
    //     } catch (error) {
    //         return [`取消委托失败: ${error.message}`, "fail"];
    //     }
    // }

    /**
     * 
     * trx转账
     * 
     */
    async trxTransfer(receiverAddress, amountTrx) {
        try {
            const unsignedTxn = await this.tronWeb.transactionBuilder.sendTrx(
                receiverAddress, amountTrx * 10 ** 6, this.ownerAddress
            );
            const signedTxn = await this.tronWeb.trx.sign(unsignedTxn, this.privateKey);
            const receipt = await this.tronWeb.trx.sendRawTransaction(signedTxn);
            if (!receipt || !receipt.txid || !receipt.result) {
                throw new Error("转账失败");
            }
            // console.log(receipt);
            return [receipt.txid];
        } catch (error) {
            return [error.message, "fail"];
        }
    }


    /**
     * 
     * usdt转账
     * 
     */
    async usdtTransfer(receiverAddress, amountTrx) {
        try {
            const contract = await this.tronWeb.contract().at(USDT_CONTRACT);
            const tx = await contract.transfer(
                receiverAddress,
                this.tronWeb.toSun(amountTrx)
            ).send({
                feeLimit: 100_000_000
            });
            return [tx];
        } catch (error) {
            return [error.message, "fail"];
        }
    }

    async getResourceRentTrx(item) {
        let amountTrx;
        switch (item.resource_type) {
            case "ENERGY":
                amountTrx = await this.swapEnergyToTrx(item.amount);
                break;
            case "BANDWIDTH":
                amountTrx = await this.swapBandwidthToTrx(item.amount);
                break;
        }
        return amountTrx;
    }

    /**
     * 
     * 处理资源（能量，带宽）
     * 
     */
    async resourceRentDoInit() {
        await resourceRentFunc.init.call(this);
    }

    /**
     * 
     * 查看租赁的资源，过期回收
     * 
     */

    async resourceRentRecoverInit() {
        await resourceRentRecoverFunc.init.call(this);
    }

    async userWithdrawInit() {
        await userWithdrawFunc.init.call(this);
    }

    async userRechargeInit() {
        await userRechargeFunc.init.call(this);
    }

}

export default TronResourceManager;