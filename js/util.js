import bcrypt from "bcrypt";
import md5 from "md5";

export const pwdWrapper = async (password) => {
    const salt = "cdqdafadf!@SWW!";
    const pwdSalt = md5(salt + password);
    return await bcrypt.hash(pwdSalt, 10);
}

export const reqestWrapper = (data, msg = "success", code = 200) => {
    return {
        code,
        msg,
        data,
    }
}

export const jsDate = (format, timestamp) => {
    const date = timestamp ? new Date(timestamp) : new Date();
    const map = {
        Y: date.getFullYear(),
        y: String(date.getFullYear()).slice(-2),
        m: ('0' + (date.getMonth() + 1)).slice(-2),
        n: date.getMonth() + 1,
        d: ('0' + date.getDate()).slice(-2),
        j: date.getDate(),
        H: ('0' + date.getHours()).slice(-2),
        G: date.getHours(),
        i: ('0' + date.getMinutes()).slice(-2),
        s: ('0' + date.getSeconds()).slice(-2)
    };
    return format.replace(/Y|y|m|n|d|j|H|G|i|s/g, match => map[match]);
}