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

// status: { 1: 质押, 2: 取消质押, }
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

export const createDelegateToOther = async (amount, resource_type, owner_address, receiver_address, txid, status = 1) => {
    try {
        const [result] = await promisePool.query(
            `INSERT INTO 
            delegate_to_other 
            (amount, resource_type, owner_address, receiver_address, txid, status) 
            VALUES 
            (?, ?, ?, ?, ?, ?)`,
            [amount, resource_type, owner_address, receiver_address, txid, status]
        );
        return result;
    } catch (err) {
        console.error(err);
    }
}
