import express from "express"
import cors from "cors"
import session from "express-session"
import { reqestWrapper } from "./util.js"
import { TronWeb } from "tronweb"
import tronService from "./tronService.js"
import userService from "./userService.js"
import { myServicePort } from "./config.js"

const app = express()

app.use(cors())

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use(session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.post("/register", async (req, res) => {
    const { userName, nickName, password, email } = req.body;
    const result = await userService.register(userName, nickName, password, email);
    res.send(reqestWrapper(...result));
})

app.post("/login", async (req, res) => {
    const { userName, password } = req.body;
    const ret = await userService.login(userName, password);
    res.send(reqestWrapper(ret));
})

app.post("/create-wallet", async (req, res) => {
    const account = await TronWeb.createAccount()
    res.send(reqestWrapper(account))
})

// type: "BANDWIDTH" or "ENERGY"
app.post("/stake-for-self", async (req, res) => {
    const { amountTrx, resourceType } = req.body
    const result = await tronService.stakeForSelf(amountTrx, resourceType)
    res.send(reqestWrapper(...result))
})

app.post("/unstake-for-self", async (req, res) => {
    const { amountTrx, resourceType } = req.body
    const result = await tronService.unstakeForSelf(amountTrx, resourceType)
    res.send(reqestWrapper(...result))
})

app.post("/delegate-to-other", async (req, res) => {
    const { amountTrx, receiverAddress, delegateTime, resourceType } = req.body
    const result = await tronService.delegateToOther(amountTrx, receiverAddress, delegateTime, resourceType)
    res.send(reqestWrapper(...result))
})

app.post("/undelegate-from-other", async (req, res) => {
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
app.post("/resource/rent", async (req, res) => {
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

app.listen(myServicePort)