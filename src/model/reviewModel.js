const mongoose = require("mongoose")
const objectId = mongoose.Schema.Types.ObjectId
const reviewSchema = new mongoose.Schema(
    {
        bookId: {
            type: objectId,
            //required: true,
            ref: "book"
        },
        reviewedBy: {
            type: String,
            required: true,
            default: 'Guest',
            value: { String }
        },
        reviewedAt: { type: Date, required: true },
        rating: {
            type: Number,
            //minLen: 1,
            //maxLen: 5,
            required: true
        },
        review: { type: String },
        isDeleted: { type: Boolean, default: false },
    }
);

module.exports = mongoose.model('review', reviewSchema)