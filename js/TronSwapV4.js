// file: testnet-send.mjs
import { TronWeb } from 'tronweb';

const PK = "C3006D24BAF70ED71349E85FFC1004769BCDB6A62AA309F259E82F061952ADC9";   // 私钥
const FROM = "TYeVen55WyknWPUpZemobRbs3cUEM8KJhy"; // 付款地址 T...
const TO = "TTx2upsPjpFjHNT4qtwwpvXo4JpTumZXWN";   // 收款地址
const NETWORK = "nile";

const fullHost =
    NETWORK === 'shasta'
        ? 'https://api.shasta.trongrid.io'
        : 'https://nile.trongrid.io'; // ✅ 新的 Nile 端点

// USDT 测试币合约（Nile 官方水龙头页面提供的地址）
const USDT_NILE = 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf'; // Nile
const USDT = NETWORK === 'shasta' ? process.env.USDT_SHASTA : USDT_NILE;

const tronWeb = new TronWeb({ fullHost, privateKey: PK });

// 规范化地址，避免 “Invalid recipient”
function normalizeToBase58(addr) {
    let a = String(addr || '').trim();
    if (a.startsWith('0x')) a = a.slice(2);
    if (/^41[a-fA-F0-9]{40}$/.test(a)) return tronWeb.address.fromHex(a);
    if (tronWeb.isAddress(a)) return tronWeb.address.fromHex(tronWeb.address.toHex(a));
    throw new Error(`Invalid TRON address: ${addr}`);
}

async function main() {
    const to58 = normalizeToBase58(TO);

    // 1) 发送 1 TRX
    const tx1 = await tronWeb.trx.sendTransaction(to58, tronWeb.toSun(1));
    console.log('TRX txid:', tx1.txid);

    // 2) 发送 2.5 USDT（精度 6）
    const usdt = await tronWeb.contract().at(USDT);
    const tx2 = await usdt.transfer(to58, 2_500_000).send({
        feeLimit: 20_000_000,
        shouldPollResponse: true
    });
    console.log('USDT tx:', tx2);
}

main().catch(e => (console.error(e), process.exit(1)));
