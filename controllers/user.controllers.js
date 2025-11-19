const bcrypt = require("bcryptjs")
const saltRounds = 10
const nodemailer = require("nodemailer")
const User = require("../models/user.models")

const jsonWebToken = require("jsonwebtoken")


const getSignup = (req, res) => {
    res.render("signup")
}

const postSignup = (req, res) => {
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
                subject: "Welcome to our routerlication",

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
                                <p>Best regards,<br>Your routerlication Team</p>
                            </div>
                            <div class="footer">
                                <p>This email was sent to ${email}. If you didn't create this account, please ignore this email.</p>
                                <p>&copy; ${new Date().getFullYear()} Your routerlication. All rights reserved.</p>
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
            })
            res.status(201).json({success: true, message: "User signed up successfully"})
        })
}

const getSignin= (req, res) => {
    res.render("signin")
}

const postSignin = (req, res) => {
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

                    res.status(201).json({success: true, message: "signin successful"})

                    console.log(`logged in successfully`)

                })
        })

}

const getDashboard = (req, res) => {
    res.render("dashboard")
}



module.exports = {
    getSignup,
    postSignup,
    getSignin,
    postSignin,
    getDashboard
}