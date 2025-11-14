const express = require("express")
const app = express()
const ejs = require("ejs")
const dotenv = require("dotenv")
dotenv.config()
const port = process.env.PORT || 3000
const mongoose = require("mongoose")
const URI = process.env.MONGO_URI
app.set("view engine", "ejs")
const userRoutes = require("./routes/user.routes")

const cors = require("cors")
app.use(cors({
    origin: "http://localhost:5173",
    methods: "GET, POST, PUT, DELETE, PATCH",
    credentials: true
}))

// const signInUrl = process.env.BASE_URL

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/user", userRoutes)


mongoose.connect(URI)
    .then(() => {
        console.log('connected to mongodb');
    }).catch((err) => {
        console.log("connection error", err)
    })


app.listen(port, () => {
    console.log("App is running on port 3000")
})


// Authentication Steps
// Check for empty input
// Validate strong password
// Check if user already exists
// Hash password
// Save new user

// Login Steps
// Check for empty input
// Find user by email
// Compare password
// Grant or deny access

// AUTHENTICATION - To check if a user is authentic, To confirm if a user exists. 
// AUTHORIZATION - Gives the user access and privileges to protected resources
// - To check if an authentic user has the right to access certain resources.