const mongoose = require("mongoose")

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

module.exports = mongoose.model("User", firstSchema)