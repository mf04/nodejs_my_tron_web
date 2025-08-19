import { pwdWrapper, pwdCompare } from "./util.js";
import { userItemGenerate, isUserItemExist, userItemGet } from "./MyMysql/Index.js"

class UserService {
    async login(userName, password) {
        const dbPwd = await userItemGet(userName);
        return await pwdCompare(password, dbPwd);
    }

    async register(userName, nickName, password, email) {
        const isUserExist = await isUserItemExist(userName, email);
        if (isUserExist && isUserExist.length) {
            return ["用户已经存在", "fail"];
        }
        const hashPwd = await pwdWrapper(password);
        const res = await userItemGenerate(
            userName, nickName, hashPwd, password, email, 0
        );
        return [res.insertId || -1];
    }
}

const userService = new UserService;

export default userService;