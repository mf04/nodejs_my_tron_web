import mysql from "mysql2"
import {
    mysqlHost, mysqlUser, mysqlPwd, mysqlDb
} from "../config.js"

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
