import {
    getResourceRentList,
    resourceRentItemUpdate,
} from "./MyMysql/Index.js";

async function delegateEvent(amount, address, type) {
    return await this.delegateToOtherV2(
        amount, address, type
    );
}

function getResourceRentDeadLine(delegateTime) {
    const current = +new Date();
    const deadLine = current + delegateTime * 1000;
    return new Date(deadLine);
}

async function resourceRentItemUpdateToDb(params) {
    return await resourceRentItemUpdate(params);
}

async function resourceRentItemDo(item) {
    // console.log(item);
    // const amountTrx = await this.swapEnergyToTrx(item.amount);
    const amountTrx = await this.getResourceRentTrx.call(this, item);
    // console.log(item.amount, amountTrx);
    const hash = await delegateEvent.call(
        this, amountTrx, item.receiver_address, item.resource_type
    );
    console.log(hash);
    if (!hash) return;
    const processStatus = 1;
    const delegateLine = getResourceRentDeadLine(item.delegate_time);
    // console.log(item.delegate_time);
    // console.log(delegateLine);
    const result = await resourceRentItemUpdateToDb(
        [amountTrx, hash, processStatus, delegateLine]
    );
    console.log(result.insertId);
    return result.insertId;
}

export const init = async function () {
    const list = await getResourceRentList();
    for (let i = 0, item; item = list[i++];) {
        resourceRentItemDo.call(this, item);
    }
};



