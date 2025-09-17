import { balanceLogGenerate, updateUserBalance } from "./MyMysql/CmdIndex.js"
import { bigNumAdd } from "./util.js";

const balanceService = {

    init: async function (item, currency, fromType, factor = -1) {
        const balanceAfter = bigNumAdd(item.balance, item.amount * factor);
        await this.userBalanceUpdate(balanceAfter, item.user_id);
        await this.balanceLogInsert([
            item.user_id, fromType, currency, item.amount * factor, item.balance, balanceAfter
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