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
            `select id from nodejs_users where user_name = ? or email = ?`,
            [userName, email]
        );
        return result;
    } catch (error) {
        console.error(err);
    }
}

export const userItemGenerate = async (
    user_name, nick_name, password, password_txt,
    email, balance_trx, balance_usdt
) => {
    try {
        const [result] = await promisePool.query(
            `INSERT INTO nodejs_users 
            (user_name, nick_name, password_hash, password_txt, email, balance_trx, balance_usdt) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user_name, nick_name, password, password_txt, email, balance_trx, balance_usdt]
        );
        return result;
    } catch (err) {
        console.error(err);
    }
}

export const userItemGet = async (userName) => {
    try {
        const [result] = await promisePool.query(
            `select id, user_name, nick_name, password_hash, email, balance_trx, balance_usdt
            from nodejs_users where user_name = ? limit 1`,
            [userName]
        );
        return result[0] || {};
    } catch (err) {
        console.err(err);
    }
}

export const getUserProfileByUserId = async (userId) => {
    try {
        const [result] = await promisePool.query(
            `select id as userId, user_name as userName, nick_name as nickName, 
                email, balance_trx as balanceTrx, balance_usdt as balanceUsdt, 
                created_at as generateTime
            from nodejs_users where id = ? limit 1`,
            [userId]
        );
        return result[0] || {};
    } catch (err) {
        console.err(err);
    }
}

export const userRechargeGenerate = async (userId, address, amount, type, web) => {
    try {
        const [result] = await promisePool.query(
            `INSERT INTO user_recharge (user_id, address, amount, type, tron_web, status)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, address, amount, type, web, 0]
        );
        return result;
    } catch (err) {
        console.err(err);
    }
}

export const getRechargeRecord = async (userId, limit, skip) => {
    try {
        const [totalRows] = await promisePool.query(
            `select count(*) as total from user_recharge
            where user_id = ?`,
            [userId]
        );
        const total = totalRows[0]["total"];
        const [list] = await promisePool.query(
            `select id, user_id as userId, amount, type, created_at as generateTime
            from user_recharge
            where user_id = ?
            order by id desc
            limit ? offset ?
            `,
            [userId, limit, skip]
        );
        return { total, list };
    } catch (err) {
        console.err(err);
    }
}