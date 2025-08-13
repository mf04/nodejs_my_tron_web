import express from "express"
import cors from "cors"
import { reqestWrapper } from "./util.js"
import { TronWeb } from "tronweb"
import tronService from "./tronService.js"

const app = express()

app.use(cors())

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.post("/create-wallet", async (req, res) => {
    const account = await TronWeb.createAccount()
    res.send(reqestWrapper(account))
})

// type: "BANDWIDTH" or "ENERGY"
app.post("/stake-for-self", async (req, res) => {
    const { amountTrx, resourceType } = req.body
    // console.log(amountTrx, resourceType)
    const receipt = await tronService.stakeForSelf(amountTrx, resourceType)
    res.send(reqestWrapper(receipt.result))
})

app.post("/unstake-for-self", async (req, res) => {
    const { amountTrx, resourceType } = req.body
    const receipt = await tronService.unstakeForSelf(amountTrx, resourceType)
    res.send(reqestWrapper(receipt.result))
})

app.post("/delegate-to-other", async (req, res) => {
    const { amountTrx, receiverAddress, delegateTime, resourceType } = req.body
    const receipt = await tronService.delegateToOther(amountTrx, receiverAddress, delegateTime, resourceType)
    res.send(reqestWrapper(receipt.result))
})

app.post("/undelegate-from-other", async (req, res) => {
    const { amountTrx, receiverAddress, resourceType } = req.body
    const receipt = await tronService.undelegateFromOther(amountTrx, receiverAddress, resourceType)
    res.send(reqestWrapper(receipt.result))
})

app.post("/withdraw-expired-balance", async (req, res) => {
    const receipt = await tronService.withdrawExpiredBalance()
    res.send(reqestWrapper(receipt.result));
})

app.get("/get-energy-exchange-rate", async (req, res) => {
    const ret = await tronService.getEnergyExchangeRate();
    res.send(reqestWrapper(ret));
})

/**
 * 
 * 资源租赁
 * amount: 65000
 * resourceType: ENERGY
 * rentTime: 10
 * 
 */
app.post("/resource/rent", async (req, res) => {
    const { amount, resourceType, rentTime, receiverAddress } = req.body
    const ret = await tronService.resourceRent(amount, resourceType, rentTime, receiverAddress)
    res.send(reqestWrapper(ret))
})

app.listen(3000)