import { getResourceGoodsItemPrice } from "./MyMysql/Index.js";

const priceService = {

    getBuyEnergyPrice: async (type, amount, rentTime) => {
        // console.log("-----getBuyEnergyPrice-----");
        const price = await getResourceGoodsItemPrice(type, amount, rentTime);
        // console.log(price);
        return price * 1;
    },

    getBuyBandwidthPrice: async (type, amount, rentTime) => {
        // console.log("-----getBuyBandwidthPrice-----");
        const price = await getResourceGoodsItemPrice(type, amount, rentTime);
        // console.log(type, amount, rentTime, price);
        return price * 1;
    }

}

export default priceService;