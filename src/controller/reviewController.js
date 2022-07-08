const booksModel = require("../model/booksModel");
const reviewModel = require("../model/reviewModel");
const mongoose = require("mongoose");


const createReview = async function (req, res) {
    try {
        const details = req.body;
        const bookId = req.params.bookId;

        if (!bookId || bookId === undefined) return res.status(400).send({ status: false, msg: "userId is required" })

        var isValidId = mongoose.Types.ObjectId.isValid(bookId)
        if (!isValidId) return res.status(400).send({ status: false, msg: "Enter valid user id" })
        let bookDetails = await booksModel.findOne({ _id: bookId, isDeleted: false });
        if (!bookDetails) { res.status(400).send({ status: false, msg: "The book with the given user id doesn't exist" }) };

        let { reviewedBy, reviewedAt, rating, reviews } = details;
        //validation for empty body
        if (Object.keys(details).length < 1) { return res.status(400).send({ msg: "Insert data :Bad request" }) }

        const data = await reviewModel.create(details)
        bookDetails.reviews = bookDetails.reviews + 1;
         await booksModel.findOneAndUpdate({ _id: bookId }, { reviews: bookDetails.reviews }, { new: true })
        res.status(200).send({ status: true, data: data })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}


module.exports = { createReview }