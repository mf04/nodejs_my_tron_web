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
    console.log(item);
    const amountTrx = await this.swapEnergyToTrx(item.amount);
    console.log(amountTrx);
    const hash = await delegateEvent.call(
        this, amountTrx, item.receiver_address, item.resource_type
    );
    if (!hash) return;
    const processStatus = 1;
    const delegateLine = getResourceRentDeadLine(item.delegate_time);
    const result = resourceRentItemUpdateToDb([hash, processStatus, delegateLine]);
    console.log(result);
}

export const init = async function () {
    const list = await getResourceRentList();
    console.log(list);
    for (let i = 0, item; item = list[i++];) {
        await resourceRentItemDo.call(this, item);
    }
};



