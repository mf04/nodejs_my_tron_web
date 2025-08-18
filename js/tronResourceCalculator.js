import axios from "axios";

// TRON网络的核心参数 (固定值)
const TOTAL_BANDWIDTH_POINTS = 43200000000; // 每日全网可分配的带宽点数总量
const TOTAL_ENERGY_POINTS = 180000000000;  // 每日全网可分配的能量总量

/**
 * TronGrid API的URL，用于获取网络资源数据。
 * 我们使用 'getaccountresource'，它能更可靠地返回全网质押数据。
 */
// const TRONGRID_API_URL = 'https://api.trongrid.io/wallet/getaccountresource';
const TRONGRID_API_URL = 'https://nile.trongrid.io/wallet/getaccountresource';
// 任何一个有效的波场地址都可以用来查询全网数据
const DUMMY_POST_DATA = { address: "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb", visible: true };

/**
 * 实时查询并计算当前波场网络上质押TRX与资源的兑换率。
 * @returns {Promise<object>} 一个包含带宽和能量兑换率的对象。
 */
async function getTronResourceExchangeRates() {
    try {
        const response = await axios.post(TRONGRID_API_URL, DUMMY_POST_DATA);

        if (response.status !== 200 || !response.data) {
            throw new Error('从 TronGrid API 获取网络数据失败，未收到有效响应。');
        }

        const networkData = response.data;

        // 从API响应中获取全网为带宽和能量质押的TRX总量
        // 注意：字段名为 TotalNetWeight 和 TotalEnergyWeight (首字母大写)
        const totalStakedForBandwidthTrx = networkData.TotalNetWeight;
        const totalStakedForEnergyTrx = networkData.TotalEnergyWeight;

        // 增加健壮性检查
        if (typeof totalStakedForBandwidthTrx === 'undefined' || typeof totalStakedForEnergyTrx === 'undefined') {
            console.error("错误：API响应中缺少必要的质押数据字段。收到的数据如下：");
            console.error(JSON.stringify(networkData, null, 2)); // 打印收到的数据结构以供调试
            throw new Error('无法从API响应中检索到总质押TRX数据。');
        }

        // --- 计算兑换率 ---

        // 1. 带宽兑换率
        // 每质押1 TRX能获得的带宽 = 每日总带宽点数 / 全网为带宽质押的TRX总量
        const bandwidthPerTrx = TOTAL_BANDWIDTH_POINTS / totalStakedForBandwidthTrx;

        // 2. 能量兑换率
        // 每质押1 TRX能获得的能量 = 每日总能量 / 全网为能量质押的TRX总量
        const energyPerTrx = TOTAL_ENERGY_POINTS / totalStakedForEnergyTrx;

        // --- 计算实用数据 ---
        const trxToGet100kBandwidth = 100000 / bandwidthPerTrx;
        const trxToGet100kEnergy = 100000 / energyPerTrx;

        return {
            success: true,
            rates: {
                bandwidthPerTrx: bandwidthPerTrx,
                energyPerTrx: energyPerTrx
            },
            practicalExamples: {
                trxToGet100kBandwidth: trxToGet100kBandwidth,
                trxToGet100kEnergy: trxToGet100kEnergy
            },
            rawData: {
                totalStakedForBandwidthTrx: totalStakedForBandwidthTrx,
                totalStakedForEnergyTrx: totalStakedForEnergyTrx,
                totalDailyBandwidth: TOTAL_BANDWIDTH_POINTS,
                totalDailyEnergy: TOTAL_ENERGY_POINTS
            }
        };

    } catch (error) {
        // 区分是网络错误还是逻辑错误
        const errorMessage = error.response ? `API请求失败，状态码: ${error.response.status}` : error.message;
        console.error("计算TRON资源费率时出错:", errorMessage);
        return {
            success: false,
            error: errorMessage
        };
    }
}

// --- 执行并打印结果 ---
(async () => {
    console.log("正在实时查询波场网络资源兑换率...");
    const result = await getTronResourceExchangeRates();

    if (result.success) {
        console.log("\n================ 实时计算结果 ================");
        console.log(`[带宽] 质押 1 TRX ≈ ${result.rates.bandwidthPerTrx.toFixed(4)} 带宽点`);
        console.log(`[能量] 质押 1 TRX ≈ ${result.rates.energyPerTrx.toFixed(4)} 能量`);
        console.log("-----------------------------------------------");
        console.log(`要获得 100,000 带宽点，大约需要质押 ${result.practicalExamples.trxToGet100kBandwidth.toFixed(2)} TRX`);
        console.log(`要获得 100,000 能量，大约需要质押 ${result.practicalExamples.trxToGet100kEnergy.toFixed(2)} TRX`);
        console.log("===============================================");
        console.log("\n*注意：该兑换率根据全网总质押量动态变化。\n");
    } else {
        console.log("\n计算失败。");
        console.log("错误详情:", result.error);
    }
})();