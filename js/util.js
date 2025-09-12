import bcrypt from "bcrypt";
import md5 from "md5";
import path from "path";
import { fileURLToPath } from "url";
import b from "bignumber.js";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export const bigNumDecimal = (number, decimal = 2) => {
    return b(number * 1).toFixed(decimal);
}

export const bigNumSub = (n1, n2, decimal = 2) => {
    return b(n1).minus(n2).toFixed(decimal);
}

export const bigNumAdd = (n1, n2, decimal = 2) => {
    return b(n1).plus(n2).toFixed(decimal);
}

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

export const isArray = (obj) => {
    return Object.prototype.toString.call(obj) == "[object Array]";
};

export const toTwo = (number) => {
    return number * 1 > 9 ? "" + number : "0" + number;
};

export const formatNumber = (number) => {
    if (isNaN(number)) {
        return number;
    }
    const symbol = number >= 0 ? "" : "-";
    let numStr = number.toString();
    const numArr = numStr.match(/(\d+(?:\.\d{1,2})?)\d*/) || [];
    return (
        symbol + numArr[1].replace(/(\d)(?=(?:\d{3})+(?:\.\d{1,2})?$)/g, "$1,")
    );
};

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

export const newAsync = (ClassType, ...args) => {
    return (async () => {
        const instance = new ClassType(...args);
        if (typeof instance.init === "function") {
            await instance.init();
        }
        return instance;
    })();
}

export const sleep = (time = 1) => {
    return new Promise(resolve => setTimeout(() => resolve(), time * 1000))
}

export const generateOrderNumber = () => {
    // 获取当前时间戳（毫秒）
    const timestamp = Date.now().toString(); // 13位
    // 生成5位随机数
    const randomNum = Math.floor(Math.random() * 90000) + 10000;
    // 拼接时间戳和随机数
    const orderNumber = timestamp + randomNum.toString();
    return orderNumber;
}

export const formatDate = (format, date = new Date()) => {
    const isDateFormat = Object.prototype.toString.call(date) === "[object Date]";
    if (!isDateFormat) {
        date = new Date(date);
    }
    const map = {
        Y: date.getFullYear(),
        m: ('0' + (date.getMonth() + 1)).slice(-2),
        d: ('0' + date.getDate()).slice(-2),
        H: ('0' + date.getHours()).slice(-2),
        i: ('0' + date.getMinutes()).slice(-2),
        s: ('0' + date.getSeconds()).slice(-2),
    };
    return format.replace(/Y|m|d|H|i|s/g, matched => map[matched]);
}
