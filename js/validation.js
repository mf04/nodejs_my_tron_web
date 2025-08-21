import { body, validationResult } from "express-validator";
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
    body("userName").notEmpty().withMessage("user name is required"),
    body("nickName").notEmpty().withMessage("nick name is required"),
    body("password").notEmpty().withMessage("password is required"),
    body("email").notEmpty().withMessage("email is required"),
];

const loginRules = [
    body("userName").notEmpty().withMessage("user name is required"),
    body("password").notEmpty().withMessage("password is required"),
];

const stakeForSelfRules = [
    body("amountTrx").isNumeric().withMessage("amount is numeric"),
    body("resourceType").notEmpty().withMessage("resource type is required"),
];

const unstakeForSelfRules = [
    body("amountTrx").isNumeric().withMessage("amount is numeric"),
    body("resourceType").notEmpty().withMessage("resource type is required"),
];

const delegateToOtherRules = [
    body("amountTrx").isNumeric().withMessage("amount is numeric"),
    body("receiverAddress").notEmpty().withMessage("receiver address is required"),
    body("delegateTime").isNumeric().withMessage("delegate time is numeric"),
    body("resourceType").notEmpty().withMessage("resource type is required"),
];

const undelegateFromOtherRules = [
    body("amountTrx").isNumeric().withMessage("amount is numeric"),
    body("receiverAddress").notEmpty().withMessage("receiver address is required"),
    body("resourceType").notEmpty().withMessage("resource type is required"),
];

const resourceRentRules = [
    body("resourceAmount").isNumeric().withMessage("resource amount is required"),
    body("resourceType").notEmpty().withMessage("resource type is required"),
    body("rentTime").isNumeric().withMessage("rent time is numeric"),
    body("receiverAddress").notEmpty().withMessage("receiver address is required"),
];

const trxTransferRules = [
    body("receiverAddress").notEmpty().withMessage("receiver address is required"),
    body("amountTrx").isNumeric().withMessage("amount is numeric"),
];

const usdtTransferRules = [
    body("receiverAddress").notEmpty().withMessage("receiver address is required"),
    body("amountTrx").isNumeric().withMessage("amount is numeric"),
];

const encryptRules = [
    body("message").notEmpty().withMessage("message is required"),
];

const decryptRules = [
    body("message").notEmpty().withMessage("message is required"),
];

const userRechargeRules = [
    body("address").notEmpty().withMessage("address is required"),
    body("amount").notEmpty().withMessage("amount is required"),
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
}