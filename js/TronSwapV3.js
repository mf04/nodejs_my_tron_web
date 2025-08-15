import { TronWeb } from "tronweb"
// tron-demo.js (Node 18+)
// const TronWeb = require('tronweb');
// const PK = process.env.PK;                      // 你的私钥
// const FROM = process.env.FROM;                  // 你的钱包地址(T-开头)
const PK = "C3006D24BAF70ED71349E85FFC1004769BCDB6A62AA309F259E82F061952ADC9"; // 你的私钥
const FROM = "TYeVen55WyknWPUpZemobRbs3cUEM8KJhy"; // 你的钱包地址(T-开头)

const tronWeb = new TronWeb({
    //   fullHost: 'https://api.trongrid.io',
    fullHost: 'https://nile.trongrid.io',
    privateKey: PK
});

// const USDT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
// const ROUTER = 'TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax';

const USDT = 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf';
const ROUTER = 'TDAQGC5Ekd683GjekSaLzCaeg7jGsGSmbh';

// 最小 ABI（只保留本例需要的函数）
const ROUTER_ABI = [
    { "name": "WETH", "type": "function", "stateMutability": "pure", "inputs": [], "outputs": [{ "type": "address" }] },
    { "name": "getAmountsOut", "type": "function", "stateMutability": "view", "inputs": [{ "name": "amountIn", "type": "uint256" }, { "name": "path", "type": "address[]" }], "outputs": [{ "type": "uint256[]" }] },
    { "name": "swapExactTokensForETH", "type": "function", "stateMutability": "nonpayable", "inputs": [{ "name": "amountIn", "type": "uint256" }, { "name": "amountOutMin", "type": "uint256" }, { "name": "path", "type": "address[]" }, { "name": "to", "type": "address" }, { "name": "deadline", "type": "uint256" }], "outputs": [{ "type": "uint256[]" }] },
    { "name": "swapExactETHForTokens", "type": "function", "stateMutability": "payable", "inputs": [{ "name": "amountOutMin", "type": "uint256" }, { "name": "path", "type": "address[]" }, { "name": "to", "type": "address" }, { "name": "deadline", "type": "uint256" }], "outputs": [{ "type": "uint256[]" }] }
];

(async () => {
    const TO = 'T...接收地址...';

    // A) 转 TRX：1 TRX
    await tronWeb.trx.sendTransaction(TO, tronWeb.toSun(1));
    console.log('Sent 1 TRX');

    // B) 转 USDT：注意 USDT 精度 6 —— 1 USDT = 1_000_000
    const usdt = await tronWeb.contract().at(USDT);
    await usdt.transfer(TO, 1_000_000).send({ feeLimit: 15_000_000 }); // 1 USDT
    console.log('Sent 1 USDT');

    // C1) USDT -> TRX（通过 SunSwap）
    const router = await tronWeb.contract(ROUTER_ABI, ROUTER);
    const WTRX = await router.WETH().call();

    const amountInUSDT = 10_000_000; // 10 USDT
    // 先授权 Router 消耗 USDT
    await usdt.approve(ROUTER, amountInUSDT).send({ feeLimit: 15_000_000 });

    // 预估可换多少 TRX
    const path1 = [USDT, WTRX];
    const out1 = await router.getAmountsOut(amountInUSDT, path1).call();
    const expectTRX = Number(out1[1]);
    const slippage = 0.005; // 0.5% 滑点
    const amountOutMinTRX = Math.floor(expectTRX * (1 - slippage));
    const deadline = Math.floor(Date.now() / 1000) + 600;

    await router.swapExactTokensForETH(
        amountInUSDT, amountOutMinTRX, path1, FROM, deadline
    ).send({ feeLimit: 50_000_000 });
    console.log(`Swapped USDT->TRX ~${expectTRX / 1e6} TRX`);

    // C2) TRX -> USDT（通过 SunSwap）
    const amountInTRX = tronWeb.toSun(50); // 50 TRX
    const path2 = [WTRX, USDT];
    const out2 = await router.getAmountsOut(amountInTRX, path2).call();
    const expectUSDT = Number(out2[1]);
    const amountOutMinUSDT = Math.floor(expectUSDT * (1 - slippage));

    await router.swapExactETHForTokens(
        amountOutMinUSDT, path2, FROM, deadline
    ).send({ feeLimit: 50_000_000, callValue: amountInTRX });
    console.log(`Swapped TRX->USDT ~${expectUSDT / 1e6} USDT`);
})();
