import { pwdWrapper, pwdCompare } from "./util.js";
import {
    userItemGenerate,
    isUserItemExist,
    userItemGet,
    getWithdrawRecord,
    getUserAvailableTrx,
    updateUserTrxBalance,
} from "./MyMysql/Index.js"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "./config.js"
import {
    userRechargeGenerate,
    getUserProfileByUserId,
    getRechargeRecord,
    userItemAvatarUpload,
} from "./MyMysql/Index.js"
import MyService from "./MyService.js"

class UserService extends MyService {

    constructor() {
        super();
    }

    async login(userName, password) {
        try {
            const myUserItem = await userItemGet(userName);
            if (!myUserItem || !myUserItem["password_hash"]) {
                throw new Error("用户不存在");
            }
            const isLoginSuccess = await pwdCompare(password, myUserItem["password_hash"]);
            if (!isLoginSuccess) {
                throw new Error("用户名或密码错误");
            }
            const payload = {
                id: myUserItem.id,
                username: myUserItem.user_name,
            }
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
            return {
                token,
                userName: myUserItem.user_name,
                nickName: myUserItem.nick_name,
                avatar: myUserItem.avatar,
                email: myUserItem.email,
                phone: myUserItem.phone,
                telegramId: myUserItem.telegram,
                balanceTrx: myUserItem.balance_trx,
                balanceTrxLock: myUserItem.balance_trx_lock,
                balanceUsdt: myUserItem.balance_usdt,
                balanceUsdtLock: myUserItem.balance_usdt_lock,
                createdTime: +new Date(myUserItem.created_at),
            }
        } catch (error) {
            return [error.message, "fail"];
        }
    }

    async register(userName, nickName, password, email, phone, telegram) {
        const isUserExist = await isUserItemExist(userName, email);
        if (isUserExist && isUserExist.length) {
            return ["用户已经存在", "fail"];
        }
        const hashPwd = await pwdWrapper(password);
        const res = await userItemGenerate(
            userName, nickName, hashPwd, password, email, phone, telegram, 0, 0
        );
        return [res.insertId || -1];
    }

    async userRecharge(userId, address, amount, type, web) {
        const myAddress = this.tronManager.ownerAddress;
        const res = await userRechargeGenerate(userId, address, myAddress, amount, type, web);
        return [res.insertId || -1];
    }

    async getProfile(userId) {
        return await getUserProfileByUserId(userId);
    }

    async getRechargeRecord(userId, limit, skip) {
        return await getRechargeRecord(userId, limit, skip);
    }

    async getWithdrawRecord(userId, limit, skip) {
        return await getWithdrawRecord(userId, limit, skip);
    }

    async avatarUpload(userId, file) {
        const { filename } = file;
        const avatar = `/uploads/${filename}`
        await userItemAvatarUpload(userId, avatar);
        return [avatar];
    }

    async userBalanceVerify(userId, price) {
        const balanceUsable = await getUserAvailableTrx(userId);
        return balanceUsable > price;
    }

    async userBalanceTrxInc(userId, amount) {
        return await updateUserTrxBalance(userId, amount);
    }
}

const userService = new UserService;

export default userService;