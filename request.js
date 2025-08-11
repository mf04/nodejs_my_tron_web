import axios from "./axios.js";

const apiAddress = "localhost:3000";

const request = axios.create({
    baseURL: apiAddress,
});

export const createWallet = (data = {}) => {
    return request({
        url: "/create-wallet",
        data,
        method: "post",
    })
}

export const stakeForSelf = (data = {}) => {
    return request({
        url: "/stake-for-self",
        data,
        method: "post",
    })
}

export const unstakeForSelf = (data = {}) => {
    return request({
        url: "/unstake-for-self",
        data,
        method: "post",
    })
}

export const delegateToOther = (data = {}) => {
    return request({
        url: "/delegate-to-other",
        data,
        method: "post",
    })
}

export const undelegateFromOther = (data = {}) => {
    return request({
        url: "/undelegate-from-other",
        data,
        method: "post",
    })
}

export const widthdrawExpiredBalance = (data = {}) => {
    return request({
        url: "/withdraw-expired-balance",
        data,
        method: "post",
    })
}