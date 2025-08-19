export const myPrivateKey3315 = "C3006D24BAF70ED71349E85FFC1004769BCDB6A62AA309F259E82F061952ADC9";
export const myPrivateKey3316 = "8C32CC921FA507BDADEA87A3EBF2CFA061DB4148761331F9397BE04493ED55BB";
export const myPrivateKey3317 = "5B5F7256D63526F4EBAE8CD6871E1C31AAF6917DF6CA143B2B53491C2A9890F8";

export const redisHost = "192.168.3.44";
export const redisPort = 6379;
export const redisPwd = "kingsai001!@";
export const redisDb = 6;

export const mysqlHost = "192.168.3.36";
export const mysqlUser = "root";
export const mysqlPwd = "root";
export const mysqlDb = "tronweb";

const MAINNET_CONFIG = {
    sunswapV2RouterAddress: 'TKzxdSv2sVmc1roS2jeTR1iHqRZEp4o2i8',
    usdtAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    wtrxAddress: 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR',
    usdtDecimals: 6,
    trxDecimals: 6, // 1 TRX = 1,000,000 SUN
    fullHost: 'https://api.trongrid.io'
};

const NILE_TESTNET_CONFIG = {
    sunswapV2RouterAddress: 'TDAQGC5Ekd683GjekSaLzCaeg7jGsGSmbh', // SunSwap V2 Router on Nile
    usdtAddress: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf',     // USDT on Nile
    wtrxAddress: 'TLa2f6VPqDgRE67v1736s7g2hGfxTonp22',     // WTRX on Nile
    usdtDecimals: 6,
    trxDecimals: 6,
    fullHost: 'https://api.nileex.io'
};

export const currentConfig = MAINNET_CONFIG;

export const TRONGRID_API_URL = "https://api.trongrid.io";
// export const TRONGRID_API_URL = "https://nile.trongrid.io";