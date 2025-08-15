// const TronWeb = require('tronweb');
// require('dotenv').config();

import { TronWeb } from "tronweb";
import axios from "axios";

const myPrivateKey3315 = "C3006D24BAF70ED71349E85FFC1004769BCDB6A62AA309F259E82F061952ADC9";

// TronWeb 配置
const tronWeb = new TronWeb({
    // fullHost: 'https://api.trongrid.io',
    fullHost: 'https://nile.trongrid.io',
    privateKey: myPrivateKey3315,
});

// SunSwap 合约地址
// const SUNSWAP_ROUTER = 'TK93aQoqePFQ4h7gXZQJkQJCyYjNgb9hXb';
// const USDT_TRC20 = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; 

const SUNSWAP_ROUTER = 'TJDENsfBJs4RFETt1X1W8wMDc8M5XnJhCe';
const USDT_TRC20 = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj';

async function swapTrxToUsdt(amountInSun) {
    try {
        // 1. 检查账户余额
        const account = await tronWeb.trx.getAccount();
        console.log(`当前账户: ${account.address}`);
        console.log(`TRX 余额: ${tronWeb.fromSun(account.balance)} TRX`);

        // 2. 获取兑换率
        const rate = await getSwapRate(amountInSun);
        console.log(`预计可获得: ${rate} USDT`);

        // 3. 构建交易
        const trade = await buildTrxToUsdtTrade(amountInSun, rate);

        // 4. 发送交易
        const result = await tronWeb.trx.sendRawTransaction(trade);
        console.log('交易已发送:', result);

        return result;
    } catch (error) {
        console.error('兑换失败:', error);
        throw error;
    }
}

// SunSwap API 获取兑换率
// async function getSwapRate(amountInSun) {
//     const amountInTrx = tronWeb.fromSun(amountInSun);
//     const apiUrl = `https://api.sun.io/v1/swap/quote?fromTokenAddress=TRX&toTokenAddress=${USDT_TRC20}&amount=${amountInTrx}`;
//     const response = await axios.get(apiUrl);
//     return response.data.toTokenAmount;
// }

async function getSwapRate(amountInSun) {

    const amountInTrx = tronWeb.fromSun(amountInSun);

    const apiUrl = "https://c.tronlink.org/v1/cryptocurrency/getprice?symbol=TRX&convert=USDT";

    const response = await axios.get(apiUrl);

    const rate = response.data.data.TRX.quote.USDT.price || 0;

    return amountInTrx * rate;
}

async function buildTrxToUsdtTrade(amountInSun, minUsdtAmount) {
    const routerContract = await tronWeb.contract().at(SUNSWAP_ROUTER);

    // 交易参数
    const path = [tronWeb.address.toHex('TRX'), tronWeb.address.toHex(USDT_TRC20)];
    const deadline = Math.floor(Date.now() / 1000) + 300; // 5分钟后过期

    // 构建交易
    const transaction = await routerContract
        .swapExactTokensForTokens(
            amountInSun,
            minUsdtAmount,
            path,
            tronWeb.address.toHex(process.env.PRIVATE_KEY),
            deadline
        )
        .send({
            feeLimit: 100000000,
            callValue: amountInSun
        });

    return transaction;
}

// 示例使用: 兑换 10 TRX 到 USDT
swapTrxToUsdt(tronWeb.toSun(10))
    .then((res) => {
        console.log('兑换完成')
        console.log(res)
    })
// .catch(console.error);
