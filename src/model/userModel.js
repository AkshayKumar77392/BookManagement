const mongoose = require("mongoose")
const userSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            enum: ["Mr", "Mrs", "Miss"],
            required: true

        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: string,
            required: true,
            unique: true
        },
        email: {
            type: String,
            trim: true,
            unique: true,
            required: true

        },
        password: {
            type: String,
            required: true,
            minLen: 8,
            maxLen: 15
        },
        address: {
            street: { string },
            city: { string },
            pincode: { string }
        },
    },

    { timestamps: true },

);

module.exports = mongoose.model('user', userSchema)