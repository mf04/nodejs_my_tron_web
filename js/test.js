import express from "express"

const app = express()

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
    res.send("Hello World")
})

app.get("/test", (req, res) => {
    const token = req.query.token
    res.send(`test get, token: ${token}`)
})

app.get("/test/:userId", (req, res) => {
    const userId = req.params.userId
    res.send(`test get, userId: ${userId}`)
})

app.post("/test/post", (req, res) => {
    const parmas = req.body
    res.send(`test post: aaa-${parmas.aaa}, bbb-${parmas.bbb}`)
})

app.listen(3000)