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
            type: String,
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
            type:Object,
            street: { String },
            city: { String },
            pincode: { String }
        },
    },

    { timestamps: true },

);

module.exports = mongoose.model('user', userSchema)