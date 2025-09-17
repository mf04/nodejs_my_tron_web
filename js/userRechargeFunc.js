import axios from "axios";
import { TRONGRID_API_URL, maxRechargeAckTime } from "./config.js";
import {
    getRechargeList,
    updateRechargeSuccess,
} from "./MyMysql/CmdIndex.js";
import balanceService from "./balanceService.js";

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

async function getTransationInfo(tx) {
    const contractData = tx.raw_data.contract[0].parameter.value;
    const amount = contractData.amount / 1_000_000;
    return {
        hash: tx.txID,
        amount,
        time: tx.raw_data.timestamp,
    }
}

async function myRechargeConfirmAndUpdateToDb(params) {
    console.log(params);
    const { id, userId, balance, hash, amount } = params;
    await updateRechargeSuccess([amount, hash, id]);
    await balanceService.init({
        user_id: userId,
        amount,
        balance,
    }, "trx", "recharge", 1);
}

async function rechargeItemTransation(item) {
    const transfers = await getTrxTransfers(item.send_address);
    for (let i = 0, tx; tx = transfers[i++];) {
        const info = await getTransationInfo(tx);
        const tronTime = info.time;
        const applyTime = +new Date(item.time);
        const diffTime = tronTime - applyTime;
        console.log(tronTime, applyTime, diffTime, maxRechargeAckTime);
        if (Math.abs(diffTime) > Math.abs(maxRechargeAckTime)) {
            continue;
        }
        await myRechargeConfirmAndUpdateToDb({
            id: item.id,
            userId: item.user_id,
            balance: item.balance,
            hash: info.hash,
            amount: info.amount,
        });
    }
}

export const init = async function () {
    try {
        const list = await getRechargeList();
        for (let i = 0, item; item = list[i++];) {
            await rechargeItemTransation(item);
        }
    } catch (error) {
        console.log(error.message);
    }
}