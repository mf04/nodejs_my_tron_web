import {
    getResourceRentList,
    resourceRentItemUpdate,
    resourceRentItemStatusFailUpdate,
} from "./MyMysql/CmdIndex.js";
import balanceService from "./balanceService.js";

function getResourceRentDeadLine(delegateTime) {
    const current = +new Date();
    const deadLine = current + delegateTime * 1000;
    return new Date(deadLine);
}

async function resourceRentItemUpdateToDb(rentId, delegateTime, hash, amountTrx) {
    const processStatus = 1;
    const delegateLine = getResourceRentDeadLine(delegateTime);
    return await resourceRentItemUpdate([
        amountTrx, hash, processStatus, delegateLine, rentId
    ]);
}

async function resourceRentEvent(amountTrx, item) {
    return await this.delegateToOtherV2(amountTrx, item.receiver_address, item.resource_type);
}

async function resourceRentItemFail(id) {
    const processStatus = 3;
    await resourceRentItemStatusFailUpdate([processStatus, id]);
}

async function resourceRentItemDo(item) {
    try {
        const amountTrx = await this.getResourceRentTrx.call(this, item);
        console.log(item.amount, amountTrx);
        const hash = await resourceRentEvent.call(this, amountTrx, item);
        console.log(hash);
        if (!hash || typeof hash != 'string') {
            throw new Error(hash);
        }
        await resourceRentItemUpdateToDb(
            item.id, item.delegate_time, hash, amountTrx
        );
        const balanceItem = {
            user_id: item.user_id,
            amount: item.price,
            balance: item.balance,
        };
        const fromType = "buy_" + item.resource_type.toLowerCase();
        await balanceService.init(balanceItem, "trx", fromType);
    } catch (err) {
        resourceRentItemFail(item.id);
    }
}

export const init = async function () {
    const list = await getResourceRentList();
    for (let i = 0, item; item = list[i++];) {
        // console.log(item);
        await resourceRentItemDo.call(this, item);
    }
};

