import bcrypt from "bcrypt";
import md5 from "md5";
import path from "path";
import { fileURLToPath } from "url";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export const getPwdSalt = (password) => {
    const salt = "cdqdafadf!@SWW!";
    return md5(salt + password);
}

export const pwdWrapper = async (password) => {
    const pwdSalt = getPwdSalt(password);
    return await bcrypt.hash(pwdSalt, 10);
}

export const pwdCompare = async (password, hashPwd) => {
    const pwdSalt = getPwdSalt(password);
    return await bcrypt.compare(pwdSalt, hashPwd);
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

export const generateSequence = (n) => {
    function collectOdd(num) {
        if (num > n) return [];
        return num % 2 ? [num, ...collectOdd(num + 1)] : collectOdd(num + 1);
    }
    function collectEven(num) {
        if (num > n) return [];
        return num % 2 === 0 ? [num, ...collectEven(num + 1)] : collectEven(num + 1);
    }
    return [...collectOdd(1), ...collectEven(1)];
}

export const asyncReduce = (arr, asyncCallback, initialValue) => {
    return arr.reduce(async (accPromise, current) => {
        const acc = await accPromise;
        return asyncCallback(acc, current);
    }, Promise.resolve(initialValue));
}

export const readContentFromUrl = async url => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const textContent = await response.text();
        return textContent;
    } catch (error) {
        console.error('Failed to fetch file from URL:', error);
    }
}

export const isLocalPathFnc = (path) => {
    return !/^(https?:)?\/\//.test(path);
}
