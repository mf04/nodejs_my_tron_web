import { body, query, validationResult } from "express-validator";
import { reqestWrapper } from "./util.js";

const validate = validations => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        const errArr = errors.array();
        const errMsg = errArr && errArr[0] && errArr[0]["msg"] || "";
        return res.send(reqestWrapper(errMsg, "fail"));
    };
};

const registerRules = [
    body("userName").notEmpty().withMessage("User name is required"),
    // body("nickName").notEmpty().withMessage("Nick name is required"),
    body("password").notEmpty().withMessage("Password is required"),
    body("email").notEmpty().withMessage("Email is required"),
    body("phone").notEmpty().withMessage("Phone is required"),
    body("telegram").notEmpty().withMessage("Telegram is required"),
];

const loginRules = [
    body("userName").notEmpty().withMessage("User name is required"),
    body("password").notEmpty().withMessage("Password is required"),
];

const stakeForSelfRules = [
    body("amountTrx").isNumeric().withMessage("Amount is numeric"),
    body("resourceType").notEmpty().withMessage("Resource type is required"),
];

const unstakeForSelfRules = [
    body("amountTrx").isNumeric().withMessage("Amount is numeric"),
    body("resourceType").notEmpty().withMessage("Resource type is required"),
];

const delegateToOtherRules = [
    body("amountTrx").isNumeric().withMessage("Amount is numeric"),
    body("receiverAddress").notEmpty().withMessage("Receiver address is required"),
    body("delegateTime").isNumeric().withMessage("Delegate time is numeric"),
    body("resourceType").notEmpty().withMessage("Resource type is required"),
];

const undelegateFromOtherRules = [
    body("amountTrx").isNumeric().withMessage("Amount is numeric"),
    body("receiverAddress").notEmpty().withMessage("Receiver address is required"),
    body("resourceType").notEmpty().withMessage("Resource type is required"),
];

const resourceRentRules = [
    body("resourceAmount").isNumeric().withMessage("Resource amount is required"),
    body("resourceType").notEmpty().withMessage("Resource type is required"),
    body("rentTime").isNumeric().withMessage("Rent time is numeric"),
    body("receiverAddress").notEmpty().withMessage("Receiver address is required"),
    body("maxWaitTime").notEmpty().withMessage("Max wait time is required"),
    // body("price").isNumeric().withMessage("Rent time is numeric"),
];

const trxTransferRules = [
    body("receiverAddress").notEmpty().withMessage("Receiver address is required"),
    body("amountTrx").isNumeric().withMessage("Amount is numeric"),
];

const usdtTransferRules = [
    body("receiverAddress").notEmpty().withMessage("Receiver address is required"),
    body("amountTrx").isNumeric().withMessage("Amount is numeric"),
];

const encryptRules = [
    body("message").notEmpty().withMessage("Message is required"),
];

const decryptRules = [
    body("message").notEmpty().withMessage("Message is required"),
];

const userRechargeRules = [
    body("address").notEmpty().withMessage("Address is required"),
    // body("amount").notEmpty().withMessage("Amount is required"),
    body("type").notEmpty().withMessage("Type is required"),
    body("web").notEmpty().withMessage("Web is required"),
];

const resourceGoodsRules = [
    body("titleCn").notEmpty().withMessage("Title cn is required"),
    body("titleEn").notEmpty().withMessage("Title en is required"),
    body("titleKr").notEmpty().withMessage("Title kr is required"),
    body("resourceType").notEmpty().withMessage("Resource type is required"),
    body("price").isNumeric().withMessage("Price is numeric"),
    body("unit").notEmpty().withMessage("Unit is required"),
    body("stock").isNumeric().withMessage("Stock is numeric"),
    body("amount").isNumeric().withMessage("Resource amount is numeric"),
    body("rentTime").isNumeric().withMessage("Rent time is numeric"),
];

const getResourceGoodsRules = [
    query("lang").notEmpty().withMessage("Lang is required"),
];

const getAddressInfoRules = [
    query("address").notEmpty().withMessage("Address is required"),
];

const getRechargeRecordRules = [
    query("page").isInt().withMessage("Page is required"),
    query("pageSize").isInt().withMessage("Page size is required"),
];

const resourceRentMultiRules = [
    body("paramsStr").notEmpty().withMessage("Params is required"),
];

export {
    validate,
    registerRules,
    loginRules,
    stakeForSelfRules,
    unstakeForSelfRules,
    delegateToOtherRules,
    undelegateFromOtherRules,
    resourceRentRules,
    trxTransferRules,
    usdtTransferRules,
    encryptRules,
    decryptRules,
    userRechargeRules,
    resourceGoodsRules,
    getResourceGoodsRules,
    getAddressInfoRules,
    getRechargeRecordRules,
    resourceRentMultiRules,
}