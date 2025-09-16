import {
    updateUserWithdraw,
    getUserWithdrawList,
} from "./MyMysql/CmdIndex.js";
import { withdrawFeeRate } from "./config.js";
import { bigNumTimes, bigNumSub } from "./util.js";
import balanceService from "./balanceService.js";

function getWithdrawFee(amount) {
    const fee = bigNumTimes(amount, withdrawFeeRate);
    const transAmount = bigNumSub(amount, fee);
    return { fee, transAmount };
}

async function updateUserWithdrawToDb(fee, transAmount, hash, item) {
    await updateUserWithdraw([fee, transAmount, hash, item.id]);
    await balanceService.init(item, "trx", "withdraw");
}

async function userWithdrawItemDo(item) {
    const { fee, transAmount } = getWithdrawFee(item.amount);
    // console.log(item.amount, fee, transAmount);
    const hash = await this.trxTransfer(item.receiver_address, transAmount);
    // console.log(hash);
    if (!hash) return;
    await updateUserWithdrawToDb(fee, transAmount, hash, item);
}

export const init = async function () {
    try {
        // console.log("------userWithdrawFunc---------");
        const list = await getUserWithdrawList();
        // console.log(list);
        if (!list || !list.length) return;
        for (let i = 0; i < list.length; i++) {
            await userWithdrawItemDo.call(this, list[i]);
        }
    } catch (error) {
        console.log(error.message);
    }
}