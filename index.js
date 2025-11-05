const express = require("express")
const app = express()
const ejs = require("ejs")
const dotenv = require("dotenv")
dotenv.config()
const port = process.env.PORT || 3000
const signInUrl = process.env.BASE_URL
const mongoose = require("mongoose")
const URI = process.env.MONGO_URI
app.set("view engine", "ejs")
const bcrypt = require("bcryptjs")
const saltRounds = 10

const nodemailer = require("nodemailer")

app.use(express.static("public"));


app.use(express.urlencoded({ extended: true }));
app.use(express.json())


mongoose.connect(URI)
    .then(() => {
        console.log('connected to mongodb');
    }).catch((err) => {
        console.log("connection error", err)
    })

let firstSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First Name is required"],
        match: [/^[A-Za-z]+$/, "First name must contain only letters"],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, "Last Name is required"],
        match: [/^[A-Za-z]+$/, "First name must contain only letters"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email has been taken, please choose another"],
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please provide a valid email address",
        ],
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    }
})

let User = mongoose.model("User", firstSchema)

app.get("/signup", (req, res) => {
    res.render("signup")
})

app.post("/signup", (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    console.log(req.body)

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongPasswordRegex.test(password)) {
        return res.status(400).send(
            "Password must be at least 8 characters long, contain uppercase, lowercase, a number, and a special character"
        );
    }

    User.findOne({ email })
        .then((existingUser) => {
            if (existingUser) {
                res.status(400).send("Email already exists!");
                return Promise.reject("User already exists");
            }
            return bcrypt.hash(password, saltRounds);
        })

        .then((hashedPassword) => {
            if (!hashedPassword) return;

            const newUser = new User({
                firstName,
                lastName,
                email,
                password: hashedPassword,
            });

            return newUser.save();
        })
        .then((savedUser) => {
            if (!savedUser) return;
            console.log("User registered successfully");

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,     
                }
            });
            let mailOptions = {
                from: process.env.EMAIL_USER,
                to: [req.body.email],
                subject: "Welcome to our Application",

                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            .email-container {
                                max-width: 600px;
                                margin: 0 auto;
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                            }
                            .header {
                                background-color: #4CAF50;
                                color: white;
                                padding: 20px;
                                text-align: center;
                                border-radius: 5px 5px 0 0;
                            }
                            .content {
                                padding: 20px;
                                background-color: #f9f9f9;
                                border: 1px solid #ddd;
                            }
                            .button {
                                display: inline-block;
                                padding: 10px 20px;
                                background-color: #4CAF50;
                                color: white;
                                text-decoration: none;
                                border-radius: 5px;
                                margin: 20px 0;
                            }
                            .footer {
                                text-align: center;
                                padding: 20px;
                                font-size: 12px;
                                color: #666;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="email-container">
                            <div class="header">
                                <h1>Welcome to Our Community!</h1>
                            </div>
                            <div class="content">
                                <h2>Hello ${firstName},</h2>
                                <p>Thank you for joining us! We're excited to have you as part of our community.</p>
                                <p>Your account has been successfully created with the following email: <strong>${email}</strong></p>
                                <p>Here are a few things you can do to get started:</p>
                                <ul>
                                    <li>Complete your profile</li>
                                    <li>Explore our features</li>
                                    <li>Connect with other members</li>
                                </ul>
                                <center>
                                    <a href="" class="button">Login to Your Account</a>
                                </center>
                                <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
                                <p>Best regards,<br>Your Application Team</p>
                            </div>
                            <div class="footer">
                                <p>This email was sent to ${email}. If you didn't create this account, please ignore this email.</p>
                                <p>&copy; ${new Date().getFullYear()} Your Application. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>`
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error)
                } else {
                    console.log('Email sent:', info.response)
                    console.log(info)
                }
                res.redirect("/signin")
            })
        })
})

app.get("/signin", (req, res) => {
    res.render("signin")
})
app.post("/signin", (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email })
        .then((user) => {
            if (!user) {
                res.status(400).send("No account found with that email")
                return Promise.reject("User not found");
            }
            console.log(user)
            return bcrypt.compare(password, user.password)

                .then((isMatch) => {
                    if (!isMatch) {
                        res.status(400).send("incorrect password")
                        return Promise.reject("wrong password")
                    }

                    res.render("dashboard", { user });
                    console.log(`${user.firstName} logged in successfully`)

                })
        })

})

app.get("/", (req, res) => {
    res.send(`<h1>Welcome to Node Class</h1>`)
})

app.get("/emini", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})



app.get("/dashboard", (req, res) => {
    res.render("dashboard")
})



app.listen(port, () => {
    console.log("App is running on port 3000")
})