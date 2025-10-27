const express = require("express")
const app = express()
const port = process.env.PORT || 3000
const ejs = require("ejs")
const dotenv = require("dotenv")
const mongoose = require("mongoose")
dotenv.config()
const URI = process.env.MONGO_URI


app.set("view engine", "ejs")
app.use(express.static("public"));

mongoose.connect(URI)
    .then(() => {
        console.log('connected to mongodb');
    }).catch((err) => {
        console.log("connection error", err)
    })

// app.listen(portNumber,callback function)
app.get("/", (req, res) => {
    res.send(`<h1>Welcome to Node Class</h1>`)
})

app.get("/emini", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

app.get("/signup", (req, res) => {
    res.render("signup")
})

app.get("/signin", (req, res) => {
    res.render("signin")
})

app.get("/dashboard", (req, res) => {
    res.render("dashboard")
})

app.listen(port, () => {
    console.log("App is running on port 3000")
})