import { pwdWrapper, pwdCompare } from "./util.js";
import { userItemGenerate, isUserItemExist, userItemGet } from "./MyMysql/Index.js"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "./config.js"
import { userRechargeGenerate, getUserProfileByUserId } from "./MyMysql/Index.js"

class UserService {

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
            return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        } catch (error) {
            return [error.message, "fail"];
        }
    }

    async register(userName, nickName, password, email) {
        const isUserExist = await isUserItemExist(userName, email);
        if (isUserExist && isUserExist.length) {
            return ["用户已经存在", "fail"];
        }
        const hashPwd = await pwdWrapper(password);
        const res = await userItemGenerate(
            userName, nickName, hashPwd, password, email, 0, 0
        );
        return [res.insertId || -1];
    }

    async userRecharge(userId, address, amount, type) {
        const res = await userRechargeGenerate(userId, address, amount, type);
        return [res.insertId || -1];
    }

    async getProfile(userId) {
        return await getUserProfileByUserId(userId);
    }
}

const userService = new UserService;

export default userService;