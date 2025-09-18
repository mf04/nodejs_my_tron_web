import mysql from "mysql2";
import {
    mysqlHost, mysqlUser, mysqlPwd, mysqlDb
} from "../config.js";
import {
    jsDate,
    bigNumAdd,
} from "../util.js";

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
        console.log(err);
    }
}

// status { 1:代理, 2:取消代理 }
export const createDelegateToOther = async (
    amount, resource_type, owner_address, receiver_address, txid, status,
    delegateTime, delegateDeadline, fromPk
) => {
    try {
        const orderNum = generateOrderNumber();
        console.log(orderNum);
        const [result] = await promisePool.query(
            `INSERT INTO 
            delegate_to_other 
            (amount, resource_type, owner_address, receiver_address, txid, 
            status, delegate_time, delegate_deadline, from_pk, order_num)
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                amount, resource_type, owner_address, receiver_address, txid,
                status, delegateTime, delegateDeadline, fromPk, orderNum
            ]
        );
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const createDelegateToOtherV2 = async (params) => {
    try {
        const fieldArr = [
            "user_id", "amount", "resource_type", "owner_address", "receiver_address",
            "txid", "status", "delegate_time", "delegate_deadline", "max_wait_time",
            "price", "order_num", "from_pk",
        ];
        const fieldSlice = fieldArr.slice(0, params.length);
        const placeHolder = fieldSlice.slice(0).fill("?");
        const [result] = await promisePool.query(
            `INSERT INTO delegate_to_other 
            (${fieldSlice.join(",")}) VALUES (${placeHolder.join(",")})`,
            params
        );
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const delegateToOtherExpireList = async () => {
    const nowStr = jsDate("Y-m-d H:i:s", new Date().getTime())
    const [result] = await promisePool.query(
        `SELECT * 
        from delegate_to_other
        where delegate_deadline <= '${nowStr}'
        order by delegate_deadline desc`
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
        console.log(err);
    }
}

export const userItemGenerate = async (
    user_name, nick_name, password, password_txt,
    email, phone, telegram, balance_trx, balance_usdt
) => {
    try {
        const [result] = await promisePool.query(
            `INSERT INTO nodejs_users 
            (user_name, nick_name, password_hash, password_txt, email, phone, telegram, balance_trx, balance_usdt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_name, nick_name, password, password_txt, email, phone, telegram, balance_trx, balance_usdt]
        );
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const userItemGet = async (userName) => {
    try {
        const [result] = await promisePool.query(
            `select id, user_name, nick_name, avatar, password_hash, email, 
            phone, telegram, balance_trx, balance_trx_lock, balance_usdt, 
            balance_usdt_lock, created_at
            from nodejs_users where user_name = ? limit 1`,
            [userName]
        );
        return result[0] || {};
    } catch (err) {
        console.log(err);
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
        console.log(err);
    }
}

export const userRechargeGenerate = async (userId, sendAddress, receiverAddress, type, web) => {
    try {
        // console.log("------userRechargeGenerate------");
        // console.log(userId, sendAddress, receiverAddress, type, web);
        const [result] = await promisePool.query(
            `INSERT INTO user_recharge (user_id, send_address, receiver_address, type, tron_web, status)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, sendAddress, receiverAddress, type, web, 0]
        );
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const userWithdrawGenerate = async (params) => {
    try {
        const [result] = await promisePool.query(
            `INSERT INTO user_withdraw 
            (user_id, send_address, receiver_address, amount, type, tron_web, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            params
        );
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const userItemAvatarUpload = async (userId, avatar) => {
    try {
        const [result] = await promisePool.query(
            `update nodejs_users set avatar = ? where id = ?`,
            [avatar, userId]
        );
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const getRechargeRecord = async (userId, limit, skip) => {
    try {
        const [totalRows] = await promisePool.query(
            `select count(*) as total from user_recharge
            where user_id = ? and status = 1`,
            [userId]
        );
        const total = totalRows[0]["total"];
        const [list] = await promisePool.query(
            `select id, send_address as sendAddress, 
            receiver_address as receiverAddress,
            amount, type, created_at as generateTime, hash
            from user_recharge
            where user_id = ? and status = 1
            order by id desc
            limit ? offset ?
            `,
            [userId, limit, skip]
        );
        return { total, list };
    } catch (err) {
        console.log(err);
    }
}

export const getWithdrawRecord = async (userId, limit, skip) => {
    try {
        const [totalRows] = await promisePool.query(
            `select count(*) as total
            from user_withdraw
            where user_id = ? and status = 1
            `,
            [userId]
        );
        const total = totalRows[0]["total"];
        const [list] = await promisePool.query(
            `select id, user_id as userId, send_address as sendAddress, type,
            receiver_address as receiverAddress, fee, amount, tron_web as tronWeb,
            created_at as generateTime, transation_hash as transationHash, status
            from user_withdraw
            where user_id = ? and status = 1
            order by id desc
            limit ? offset ?
            `,
            [userId, limit, skip]
        );
        return { total, list };
    } catch (err) {
        console.log(err);
    }
}

export const resourceGoodsAdd =
    async (titleCn, titleEn, titleKr, resourceType, price, unit, stock, amount, rentTime) => {
        try {
            const [result] = await promisePool.query(
                `INSERT INTO resource_goods
                (title_cn, title_en, title_kr, resource_type, price, unit, stock, resource_amount, rent_time, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [titleCn, titleEn, titleKr, resourceType, price, unit, stock, amount, rentTime, 1]
            );
            return result;
        } catch (err) {
            console.log(err);
        }
    }

export const resourceGoodsGet = async (field) => {
    try {
        const [result] = await promisePool.query(
            `select ${field}
            from resource_goods
            where status = 1
            order by id asc
            `
        );
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const getUserAvailableTrx = async (userId) => {
    try {
        const [result] = await promisePool.query(
            `SELECT (balance_trx - balance_trx_lock) as balance_usable
            from nodejs_users
            where id = ?`,
            [userId]
        );
        return result && result[0] && result[0]["balance_usable"] || 0;
    } catch (err) {
        console.log(err);
    }
}


export const getUserBalanceTrx = async (userId) => {
    try {
        const [result] = await promisePool.query(
            `select balance_trx from nodejs_users where id = ?`,
            [userId]
        );
        return result && result[0] && result[0]["balance_trx"] || 0;
    } catch (err) {
        console.log(err);
    }
}

export const updateUserTrxBalance = async (userId, amount) => {
    try {
        const [result] = await promisePool.query(
            `update nodejs_users set balance_trx = balance_trx + ? where id = ?`,
            [amount, userId]
        );
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const getUserResourceRentList = async () => {
    try {
        const [result] = await promisePool.query(
            `SELECT id, time as orderTime, resource_type as type, amount, 
            delegate_time as rentTime, price, txid as hash, 
            delegate_deadline as doneTime 
            from delegate_to_other
            ORDER BY id desc
            limit 10`
        );
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const trxBalanceLog = async (userId, fromType, currencyType, amount) => {
    try {
        const balanceBefore = await getUserBalanceTrx(userId);
        const balanceAfter = bigNumAdd(balanceBefore, amount, 6);
        // console.log(userId, fromType, currencyType, amount, balanceBefore, balanceAfter);
        const [result] = await promisePool.query(
            `insert into balance_log 
            (user_id, from_type, currency_type, amount, balance_before, balance_after) 
            values 
            (?, ?, ?, ?, ?, ?)
            `,
            [userId, fromType, currencyType, amount, balanceBefore, balanceAfter]
        );
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const userBalanceLog = async (userId) => {
    try {
        const [result] = await promisePool.query(
            `select from_type as originType, currency_type as currencyType, 
            amount, balance_after as balance, time 
            from balance_log 
            where user_id = ? 
            order by id desc 
            limit 10`,
            [userId]
        );
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const getUserOrderList = async (userId) => {
    try {
        const [result] = await promisePool.query(
            `select * from delegate_to_other where user_id = ?
            order by id desc limit 10`,
            [userId]
        );
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const getResourceGoodsItemPrice = async (type, amount, rentTime) => {
    try {
        const [result] = await promisePool.query(
            `select price from resource_goods 
            where resource_type = ? and resource_amount = ? and rent_time = ? and stock > 0
            limit 1`,
            [type, amount, rentTime]
        );
        return result && result[0] && result[0]["price"] || 0;
    } catch (err) {
        console.log(err);
    }
}

export const preRentDelegate = async (params) => {
    try {
        const fieldArr = [
            "user_id", "amount", "resource_type", "owner_address", "receiver_address",
            "delegate_status", "delegate_time", "max_wait_time", "process_deadline",
            "price", "order_num",
        ];
        const placeHolder = fieldArr.slice(0).fill("?");
        const [result] = await promisePool.query(
            `INSERT INTO delegate_to_other 
            (${fieldArr.join(",")}) VALUES (${placeHolder.join(",")})`,
            params
        );
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const undelegateItemGenerate = async (params) => {
    try {
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
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const getResourceRentList = async () => {
    try {
        const [result] = await promisePool.query(
            `SELECT user_id, amount, resource_type, delegate_time, receiver_address, price
            FROM delegate_to_other D
            INNER JOIN (
                select id, balance_trx, balance_trx_lock, 
                balance_trx - balance_trx_lock as balance_usable
                from nodejs_users
            ) U
            ON D.user_id = U.id
            WHERE process_status is null AND U.balance_usable > price
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
        const [result] = await promisePool.query(
            `update delegate_to_other
            set amount_trx = ?, txid = ?, process_status = ?, delegate_deadline = ?
            where user_id = 6`,
            params
        );
        return result;
    } catch (err) {
        console.log(err);
    }
}

export const getMyResourceRentList = async (userId) => {
    try {
        const [result] = await promisePool.query(
            `select id, amount, amount_trx as amountTrx, resource_type as resourceType, 
            time as startTime, delegate_deadline as endTime, 
            delegate_time as delegateTime,
            process_status as processStatus, order_num as orderNum, price
            from delegate_to_other
            where user_id = ? and delegate_status = 1
            order by id desc`,
            [userId]
        );
        return result;
    } catch (err) {
        console.log(err);
    }
}