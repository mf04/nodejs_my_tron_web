import { BigNumber } from "bignumber.js";

export const formattedValue = (value, decimalPlaces = 6) => {
    const bn = new BigNumber(value);
    return bn.toFixed(decimalPlaces, BigNumber.ROUND_HALF_EVEN);
}