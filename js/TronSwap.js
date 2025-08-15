import { TronWeb } from "tronweb"
import {
    currentConfig as config,
    myPrivateKey3315 as privateKey,
} from "./config.js"

class TronSwap {

    constructor(privateKey) {
        if (!privateKey) {
            throw new Error("必须提供私钥 (Private Key)！");
        }
        this.tronWeb = new TronWeb({
            // fullHost: 'https://api.shasta.trongrid.io',
            fullHost: 'https://nile.trongrid.io',
            privateKey,
        });
    }

    // async getRouterContract() {
    //     return this.tronWeb.contract().at(config.sunswapV2RouterAddress);
    // }

    // async getUsdtContract() {
    //     return this.tronWeb.contract().at(config.usdtAddress);
    // }

    async swapTrxToUstd(trxAmount, slippagePercentage = 1) {

        if (trxAmount <= 0) throw new Error('TRX amount must be positive.');

        // const routerContract = await this.tronWeb.contract().at(config.sunswapV2RouterAddress);
        // console.log(routerContract);

        const ROUTER_ADDRESS = 'TDAQGC5Ekd683GjekSaLzCaeg7jGsGSmbh';
        const USDT_ADDRESS = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj';
        const WTRX_ADDRESS = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb'; // WTRX

        const router = await this.tronWeb.contract().at(ROUTER_ADDRESS);

        // 转换 TRX 到 sun token 单位（1 TRX = 1e6 sun）
        const amountInSun = this.tronWeb.toSun(trxAmount);

        // 获取当前账户地址
        const account = this.tronWeb.defaultAddress.base58;

        console.log(router);
        console.log(amountInSun);
        console.log(account);


    }

    async swapUsdtToTrx() {
        const amountToSwap = this.tronWeb.toSun('10');
        const routerContract = await this.tronWeb.contract().at(config.sunswapV2RouterAddress);
        console.log(routerContract);
    }

}

(async () => {
    const ts = new TronSwap(privateKey);
    await ts.swapUsdtToTrx();
})();



