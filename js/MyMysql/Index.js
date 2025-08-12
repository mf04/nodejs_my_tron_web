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

export const createStakeForSelf = async (amount, resource_type, owner_address, txid) => {
    try {
        const [result] = await promisePool.query(
            `INSERT INTO 
            stake_for_self 
            (amount, resource_type, owner_address, txid, status) 
            VALUES 
            (?, ?, ?, ?, ?)`,
            [amount, resource_type, owner_address, txid, 0]
        );
        return result;
    } catch (err) {
        console.error(err);
    }
}
