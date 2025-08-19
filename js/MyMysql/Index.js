import mysql from "mysql2"
import {
    mysqlHost, mysqlUser, mysqlPwd, mysqlDb
} from "../config.js"
import { jsDate } from "../util.js"

const pool = mysql.createPool({
    host: mysqlHost,
    user: mysqlUser,
    password: mysqlPwd,
    database: mysqlDb,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

// status: { 1: 质押, 2: 解锁, 3：提取 }
export const createStakeForSelf = async (amount, resource_type, owner_address, txid, status = 1) => {
    try {
        const [result] = await promisePool.query(
            `INSERT INTO 
            stake_for_self 
            (amount, resource_type, owner_address, txid, status) 
            VALUES 
            (?, ?, ?, ?, ?)`,
            [amount, resource_type, owner_address, txid, status]
        );
        return result;
    } catch (err) {
        console.error(err);
    }
}

// status { 1:代理, 2:取消代理 }
export const createDelegateToOther = async (
    amount, resource_type, owner_address, receiver_address, txid, status,
    delegateTime, delegateDeadline
) => {
    try {
        const [result] = await promisePool.query(
            `INSERT INTO 
            delegate_to_other 
            (amount, resource_type, owner_address, receiver_address, txid, status, delegate_time, delegate_deadline) 
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?)`,
            [amount, resource_type, owner_address, receiver_address, txid, status, delegateTime, delegateDeadline]
        );
        return result;
    } catch (err) {
        console.error(err);
    }
}

export const delegateToOtherExpireList = async () => {
    const nowStr = jsDate("Y-m-d H:i:s", new Date().getTime())
    const [result] = await promisePool.query(
        `SELECT * from delegate_to_other
        where delegate_deadline <= '${nowStr}'`
    );
    return result;
}

export const isUserItemExist = async (userName, email) => {
    try {
        const [result] = await promisePool.query(
            `select id from users where user_name = ? or email = ?`,
            [userName, email]
        );
        return result;
    } catch (error) {
        console.error(err);
    }
}

export const userItemGenerate = async (
    user_name, nick_name, password, password_txt,
    email, balance
) => {
    try {
        const [result] = await promisePool.query(
            `INSERT INTO users (user_name, nick_name, password_hash, password_txt, email, balance) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [user_name, nick_name, password, password_txt, email, balance]
        );
        return result;
    } catch (err) {
        console.error(err);
    }
}

export const userItemGet = async (userName) => {
    try {
        const [result] = await promisePool.query(
            `select password_hash from users where user_name = ? limit 1`,
            [userName]
        );
        return result[0] && result[0]["password_hash"] || "";
    } catch (err) {
        console.err(err);
    }

}