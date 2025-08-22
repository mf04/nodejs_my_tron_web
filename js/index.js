import express from "express"
import cors from "cors"
// import session from "express-session"
import { reqestWrapper } from "./util.js"
import { TronWeb } from "tronweb"
import tronService from "./tronService.js"
import userService from "./userService.js"
import { myServicePort } from "./config.js"
import cryptoService from "./cryptoService.js";
import { readPrivateKeyFile } from "./fsService.js"
import { authenticateToken } from "./middleware/token.js"
import * as v from "./validation.js"
import pagination from "./middleware/pagination.js"

const app = express()

app.use(cors())

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

// app.use(session({
//     secret: 'my-secret',
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: false }
// }));

app.post("/register", v.validate(v.registerRules), async (req, res) => {
    const { userName, nickName, password, email } = req.body;
    const result = await userService.register(userName, nickName, password, email);
    res.send(reqestWrapper(...result));
})

app.post("/login", v.validate(v.loginRules), async (req, res) => {
    const { userName, password } = req.body;
    const ret = await userService.login(userName, password);
    res.send(reqestWrapper(ret));
})

app.get("/profile", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const myProfile = await userService.getProfile(userId);
    res.send(reqestWrapper(myProfile));
})

app.post("/create-wallet", async (req, res) => {
    const account = await TronWeb.createAccount()
    res.send(reqestWrapper(account))
})

// type: "BANDWIDTH" or "ENERGY"
app.post("/stake-for-self", v.validate(v.stakeForSelfRules), async (req, res) => {
    const { amountTrx, resourceType } = req.body
    const result = await tronService.stakeForSelf(amountTrx, resourceType)
    res.send(reqestWrapper(...result))
})

app.post("/unstake-for-self", v.validate(v.unstakeForSelfRules), async (req, res) => {
    const { amountTrx, resourceType } = req.body
    const result = await tronService.unstakeForSelf(amountTrx, resourceType)
    res.send(reqestWrapper(...result))
})

app.post("/delegate-to-other", v.validate(v.delegateToOtherRules), async (req, res) => {
    const { amountTrx, receiverAddress, delegateTime, resourceType } = req.body
    const result = await tronService.delegateToOther(amountTrx, receiverAddress, delegateTime, resourceType)
    res.send(reqestWrapper(...result))
})

app.post("/undelegate-from-other", v.validate(v.undelegateFromOtherRules), async (req, res) => {
    const { amountTrx, receiverAddress, resourceType } = req.body
    const result = await tronService.undelegateFromOther(amountTrx, receiverAddress, resourceType)
    res.send(reqestWrapper(...result))
})

app.post("/withdraw-expired-balance", async (req, res) => {
    const result = await tronService.withdrawExpiredBalance()
    res.send(reqestWrapper(...result));
})

app.get("/get-energy-exchange-rate", async (req, res) => {
    const ret = await tronService.getEnergyExchangeRate();
    res.send(reqestWrapper(ret));
})

/**
 * 
 * 资源租赁
 * resourceAmount: 65000
 * resourceType: ENERGY
 * rentTime: 10
 * 
 */
app.post("/resource/rent", v.validate(v.resourceRentRules), async (req, res) => {
    const { resourceAmount, resourceType, rentTime, receiverAddress } = req.body
    let result;
    switch (resourceType) {
        case "ENERGY":
            result = await tronService.energyRent(resourceAmount, rentTime, receiverAddress);
            break;
        case "BANDWIDTH":
            result = await tronService.bandwidthRent(resourceAmount, rentTime, receiverAddress);
            break;
    }
    res.send(reqestWrapper(...result))
})

/**
 * 
 * 租赁的资源回收
 * 
 */
app.post("/resource/recover", async (req, res) => {
    const result = await tronService.resourceRecover();
    res.send(reqestWrapper(...result))
})

/**
 * 
 * trx transfer
 * 
 */
app.post("/trx/transfer", v.validate(v.trxTransferRules), async (req, res) => {
    const { receiverAddress, amountTrx } = req.body;
    const result = await tronService.trxTransfer(receiverAddress, amountTrx);
    res.send(reqestWrapper(...result));
})

/**
 * 
 * usdt transfer
 * 
 */
app.post("/usdt/transfer", v.validate(v.usdtTransferRules), async (req, res) => {
    const { receiverAddress, amountTrx } = req.body;
    const result = await tronService.usdtTransfer(receiverAddress, amountTrx);
    res.send(reqestWrapper(...result));
})

/**
 * 
 * 字符串加密
 * 
 */
app.post("/encrypt", v.validate(v.encryptRules), (req, res) => {
    const { message } = req.body;
    const result = cryptoService.encrypt(message);
    res.send(reqestWrapper(result));
})

/**
 * 
 * 字符串解密
 * 
 */
app.post("/decrypt", v.validate(v.decryptRules), (req, res) => {
    const { message } = req.body;
    const result = cryptoService.decrypt(message);
    res.send(reqestWrapper(result));
})

/**
 * 
 * 读取私钥
 * 
 */
app.post("/get-privatekey", async (req, res) => {
    const privateKey = await readPrivateKeyFile();
    res.send(reqestWrapper(privateKey));
})

/**
 * 
 * 会员充值
 * 
 */
app.post("/user-recharge", v.validate(v.userRechargeRules), authenticateToken,
    async (req, res) => {
        const { id: userId } = req.user;
        const { address, amount, type, web } = req.body;
        const result = await userService.userRecharge(userId, address, amount, type, web);
        res.send(reqestWrapper(...result));
    })

/**
 * 
 * 会员充值记录
 * 
 */
app.get("/get-recharge-record",
    authenticateToken,
    pagination(),
    async (req, res) => {
        const userId = req.user.id;
        const { limit, skip } = req.pagination;
        const list = await userService.getRechargeRecord(userId, limit, skip);
        res.send(reqestWrapper(list));
    })


app.listen(myServicePort)