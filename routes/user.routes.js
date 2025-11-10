const express = require("express")
const router = express.Router()


const {getSignup, getSignin, postSignup, postSignin} = require("../controllers/user.controllers")


router.get("/signup", getSignup)

router.post("/signup", postSignup)

router.get("/signin", getSignin)

router.post("/signin", postSignin)

router.get("/", (req, res) => {
    res.send(`<h1>Welcome to Node Class</h1>`)
})

router.get("/emini", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})



router.get("/dashboard", (req, res) => {
    res.render("dashboard")
})


module.exports = router