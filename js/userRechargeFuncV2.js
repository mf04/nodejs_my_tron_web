import axios from "axios";
import { TRONGRID_API_URL, maxRechargeAckTime } from "./config.js";
import {
    getRechargeList,
    updateRechargeSuccess,
    getUserBalanceTrx,
} from "./MyMysql/CmdIndex.js";
import balanceService from "./balanceService.js";
import { bigNumDecimal } from "./util.js";

async function getTrxTransfers(address) {
    const url = `${TRONGRID_API_URL}/v1/accounts/${address}/transactions`;
    const response = await axios.get(url, {
        params: {
            limit: 20,
            order_by: 'block_timestamp,desc',
        }
    });
    if (!response.data || !response.data.data) {
        console.log("未能获取到交易数据。");
        return [];
    }
    const allTransactions = response.data.data;
    const trxTransfers = allTransactions.filter(tx => {
        return tx.raw_data.contract[0]?.type === 'TransferContract';
    });
    return trxTransfers;
}

function getTransationInfo(tx) {
    const contractData = tx.raw_data.contract[0].parameter.value;
    const amount = contractData.amount / 1_000_000;
    return {
        hash: tx.txID,
        amount,
        time: tx.raw_data.timestamp,
    }
}

async function getTransferList(address) {
    const transfers = await getTrxTransfers(address);
    return transfers.map(tx => {
        return getTransationInfo(tx);
    });
}

async function myRechargeConfirmAndUpdateToDb(params) {
    const { id, userId, hash, amount } = params;
    const balance = await getUserBalanceTrx(userId);
    console.log(id, userId, hash, amount, balance);
    await updateRechargeSuccess([amount, hash, id]);
    await balanceService.init({
        user_id: userId,
        amount,
        balance,
    }, "trx", "recharge", 1);
}

async function rechargeDoHandle(transferList, rechargeList) {
    for (let i = 0, rechargeItem; rechargeItem = rechargeList[i++];) {
        const filterItem = transferList.find(transferItem => {
            return bigNumDecimal(transferItem.amount) == bigNumDecimal(rechargeItem.amount);
        });
        if (!filterItem) {
            continue;
        }
        // console.log(rechargeItem);
        // console.log(filterItem);
        await myRechargeConfirmAndUpdateToDb({
            id: rechargeItem.id,
            userId: rechargeItem.user_id,
            hash: filterItem.hash,
            amount: filterItem.amount,
        });
    }
}

export const init = async function () {
    try {
        const transferList = await getTransferList(this.ownerAddress);
        // console.log(transferList);
        const rechargeList = await getRechargeList();
        await rechargeDoHandle(transferList, rechargeList);
    } catch (error) {
        console.log(error.message);
    }
}