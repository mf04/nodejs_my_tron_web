import { getResourceGoodsItemPrice } from "./MyMysql/Index.js";
import { getResourceRentPrice } from "./resource-rent-util.js";

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
    },

    getBuyResourcePrice: async (type, amount, rentTime) => {
        let price = await getResourceGoodsItemPrice(type, amount, rentTime);
        if (price == 0) {
            price = getResourceRentPrice(type, amount, rentTime);
        }
        console.log(type, amount, rentTime, price);
        return price * 1;
    }

}

export default priceService;