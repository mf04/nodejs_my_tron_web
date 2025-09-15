// import {
//     delegateToOtherExpireList,
//     undelegateItemGenerate,
// } from "./MyMysql/Index.js";

import {
    delegateToOtherExpireList,
    undelegateItemGenerate,
} from "./MyMysql/CmdIndex.js";

async function getResourceRentExpireList() {
    return await delegateToOtherExpireList();
}

function getResourceRentItemRecover(item, hash) {
    const delegateStatus = 2;
    const processStatus = 1;
    return [
        item.user_id, item.amount, item.amount_trx, item.resource_type,
        item.owner_address, item.receiver_address, item.txid, delegateStatus,
        item.delegate_time, item.delegate_deadline, item.max_wait_time,
        item.process_deadline, processStatus, item.price, item.order_num,
        item.id
    ];
}

async function resourceRentItemRecoverSaveToDb(params) {
    return await undelegateItemGenerate(params);
}

async function undelegateEvent(item) {
    const amountInSun = this.tronWeb.toSun(item.amount_trx);
    console.log(amountInSun);
    const tx = await this.tronWeb.transactionBuilder.undelegateResource(
        amountInSun, item.receiver_address, item.resource_type, item.owner_address
    );
    // console.log(tx);
    const signedTx = await this.tronWeb.trx.sign(tx);
    // console.log(signedTx);
    return await this.tronWeb.trx.sendRawTransaction(signedTx);
}

async function resourceRentItemDo(item) {
    const receipt = await undelegateEvent.call(this, item);
    // console.log(receipt);
    if (!receipt || !receipt.txid) {
        throw new Error("租用资源回收失败");
    }
    const params = getResourceRentItemRecover(item, receipt.txid);
    const result = await resourceRentItemRecoverSaveToDb(params);
    console.log(result.insertId, receipt.txid);
}

export const init = async function () {
    try {
        const list = await getResourceRentExpireList();
        console.log(`------resourceRentRecoverFunc-------${list.length}-----`);
        if (!list || !list.length) {
            throw new Error("没有到期的租赁记录");
        }
        for (let i = 0, item; item = list[i++];) {
            resourceRentItemDo.call(this, item);
        }
    } catch (error) {
        console.log(error.message);
    }
}