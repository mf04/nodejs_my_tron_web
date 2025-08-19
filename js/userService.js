import { pwdWrapper } from "./util.js";
import { userItemGenerate, isUserItemExist } from "./MyMysql/Index.js"

class UserService {
    async login(userName, password) {
        const salt = "cdqdafadf!@SWW!";
        const pwdSalt = md5(salt + password);
        console.log(pwdSalt);

        const hashPwd = await bcrypt.hash(pwdSalt, 10);
        console.log(hashPwd);

        const match = await bcrypt.compare(pwdSalt, hashPwd);
        console.log(match);

        return 3313;
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