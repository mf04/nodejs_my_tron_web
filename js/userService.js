import bcrypt from "bcrypt";

class UserService {
    async login(userName, password) {
        const hashPwd = await bcrypt.hash(password, 10);
        console.log(hashPwd);

        const match = await bcrypt.compare(password, hashPwd);
        console.log(match);

        return 3313;
    }
}

const userService = new UserService;

export default userService;