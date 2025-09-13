import { delegateToOtherExpireList } from "./MyMysql/Index.js";

async function getResourceRentExpireList() {
    return await delegateToOtherExpireList();
}

async function resourceRentItemDo(item) {
    // const amountInSun = this.tronWeb.toSun(item.amount);
    // console.log(amountInSun);
    const amountInSun = this.tronWeb.toSun();
    console.log(item);
    console.log(amountTrx);
}

export const init = async function () {
    try {
        // console.log("------resourceRentRecoverFunc------");
        const list = await getResourceRentExpireList();
        // console.log(list);
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