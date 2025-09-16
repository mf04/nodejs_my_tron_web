import { balanceLogGenerate, updateUserBalance } from "./cmd_index.js"
import { bigNumSub } from "./util.js";

const balanceService = {

    init: async function (item, currency, fromType) {
        // console.log(item);
        // console.log(currency);
        // console.log(fromType);
        // console.log(this);
        const balanceAfter = bigNumSub(item.balance, item.amount);
        await this.userBalanceUpdate(balanceAfter, item.user_id);
        await this.balanceLogInsert([
            item.user_id, fromType, currency, item.amount * -1, item.balance, balanceAfter
        ]);
    },

    userBalanceUpdate: async function (balance, userId) {
        await updateUserBalance([balance, userId]);
    },

    balanceLogInsert: async function (params) {
        await balanceLogGenerate(params);
    },
}

export default balanceService;