import mysql from "mysql2";
import {
    mysqlHost, mysqlUser, mysqlPwd, mysqlDb
} from "../config.js";
import { jsDate } from "../util.js";

const getConnectionPool = () => {
    return mysql.createPool({
        host: mysqlHost,
        user: mysqlUser,
        password: mysqlPwd,
        database: mysqlDb,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}

export const getResourceRentList = async () => {
    try {
        const pool = getConnectionPool();
        const promisePool = pool.promise();
        const [result] = await promisePool.query(
            `SELECT D.id as id, user_id, amount, resource_type, delegate_time, receiver_address, 
            price, U.balance_usable as balance
            FROM delegate_to_other D
            INNER JOIN (
                select id, balance_trx, balance_trx_lock, 
                balance_trx - balance_trx_lock as balance_usable
                from nodejs_users
            ) U
            ON D.user_id = U.id
            WHERE process_status is null 
            AND process_deadline > NOW()
            AND U.balance_usable >= price
            ORDER BY process_deadline asc`
        );
        promisePool.end();
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const resourceRentItemUpdate = async (params) => {
    try {
        const pool = getConnectionPool();
        const promisePool = pool.promise();
        const [result] = await promisePool.query(
            `update delegate_to_other
            set amount_trx = ?, txid = ?, process_status = ?, delegate_deadline = ?
            where id = ?`,
            params
        );
        promisePool.end();
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const resourceRentItemStatusFailUpdate = async (params) => {
    try {
        const pool = getConnectionPool();
        const promisePool = pool.promise();
        const [result] = await promisePool.query(
            `update delegate_to_other
            set process_status = ? where id = ?`,
            params
        );
        promisePool.end();
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const delegateToOtherExpireList = async () => {
    const nowStr = jsDate("Y-m-d H:i:s", new Date().getTime());
    const pool = getConnectionPool();
    const promisePool = pool.promise();
    const [result] = await promisePool.query(
        `SELECT * 
        from delegate_to_other
        where delegate_deadline <= '${nowStr}' 
        and delegate_status = 1 and process_status = 1
        order by delegate_deadline desc`
    );
    promisePool.end();
    return result;
}

export const undelegateItemGenerate = async (params) => {
    try {
        const pool = getConnectionPool();
        const promisePool = pool.promise();
        const fieldArr = [
            "user_id", "amount", "amount_trx", "resource_type",
            "owner_address", "receiver_address", "txid", "delegate_status",
            "delegate_time", "delegate_deadline", "max_wait_time",
            "process_deadline", "process_status", "price", "order_num",
            "from_pk",
        ];
        const placeHolder = fieldArr.slice(0).fill("?");
        const [result] = await promisePool.query(
            `INSERT INTO delegate_to_other 
            (${fieldArr.join(",")}) VALUES (${placeHolder.join(",")})`,
            params
        );
        promisePool.end();
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const getUserWithdrawList = async () => {
    try {
        const pool = getConnectionPool();
        const promisePool = pool.promise();
        const [result] = await promisePool.query(
            `SELECT UW.id as id, U.id as user_id, send_address, receiver_address, 
            (U.balance_trx - U.balance_trx_lock) as balance, amount
            from user_withdraw UW
            INNER JOIN
            nodejs_users U
            on UW.user_id = U.id 
            where status =0 
            and (U.balance_trx - U.balance_trx_lock) > UW.amount`
        );
        promisePool.end();
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const updateUserWithdraw = async (params) => {
    try {
        const pool = getConnectionPool();
        const promisePool = pool.promise();
        const [result] = await promisePool.query(
            `update user_withdraw
            set fee = ?, trans_amount = ?, transation_hash = ?, status = 1
            where id = ?
            `,
            params
        );
        promisePool.end();
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const balanceLogGenerate = async (params) => {
    try {
        const pool = getConnectionPool();
        const promisePool = pool.promise();
        const [result] = await promisePool.query(
            `insert into balance_log 
            (user_id, from_type, currency_type, amount, balance_before, balance_after) 
            values 
            (?, ?, ?, ?, ?, ?)`,
            params
        );
        promisePool.end();
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const updateUserBalance = async (params) => {
    try {
        const pool = getConnectionPool();
        const promisePool = pool.promise();
        const [result] = await promisePool.query(
            `update nodejs_users set balance_trx =  ?
            where id = ?`,
            params
        );
        promisePool.end();
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const updateDelegateProcessStatus = async (id) => {
    try {
        const pool = getConnectionPool();
        const promisePool = pool.promise();
        const [result] = await promisePool.query(
            `update delegate_to_other set process_status = 2
            where id = ?`,
            [id]
        );
        promisePool.end();
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const getRechargeList = async () => {
    try {
        const pool = getConnectionPool();
        const promisePool = pool.promise();
        const [result] = await promisePool.query(
            `select R.id as id, user_id, send_address, R.created_at as time, 
            balance_trx - balance_trx_lock as balance
            from user_recharge R
            INNER JOIN
            nodejs_users U
            on U.id = R.user_id
            where status = 0
            order by id desc`
        );
        promisePool.end();
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const updateRechargeSuccess = async (params) => {
    try {
        const pool = getConnectionPool();
        const promisePool = pool.promise();
        const [result] = await promisePool.query(
            `update user_recharge 
            set amount = ?, hash = ?, status = 1
            where id = ?`,
            params
        );
        promisePool.end();
        return result;
    } catch (err) {
        console.log(err);
    }
}