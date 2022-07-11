const booksModel = require("../model/booksModel");
const reviewModel = require("../model/reviewModel");
const mongoose = require("mongoose");
const { isValid } = require("../controller/userController");


const createReview = async function (req, res) {
    try {
        const details = req.body;
        const bookId = req.params.bookId;

        if (!bookId || bookId === undefined) return res.status(400).send({ status: false, msg: "bookId is required" })

        var isValidId = mongoose.Types.ObjectId.isValid(bookId)
        if (!isValidId) return res.status(400).send({ status: false, msg: "Enter valid user id" })
        let bookDetails = await booksModel.findOne({ _id: bookId, isDeleted: false });
        if (!bookDetails) { res.status(400).send({ status: false, msg: "The book with the given user id doesn't exist" }) };

        let { reviewedBy, reviewedAt, rating, reviews } = details;

        //validation for empty body
        if (Object.keys(details).length < 1) { return res.status(400).send({ msg: "Insert data :Bad request" }) }

        //reviewedBy validation
        if (!isValid(reviewedBy)) { return res.status(400).send({ status: false, msg: "Reviewers name is required and it must be string" }) }

        let name = /^[a-zA-Z]{2,20}$/.test(reviewedBy.trim())
        if (!name) return res.status(400).send({ status: false, msg: "enter valid name" })


        //reviewedAt validation
        if (reviewedAt === undefined || reviewedAt.trim().length === 0) return res.status(400).send({ status: false, msg: "date is required" })
        bookreviewedAt = /^\d{4}[\-\/\s]?((((0[13578])|(1[02]))[\-\/\s]?(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\-\/\s]?(([0-2][0-9])|(30)))|(02[\-\/\s]?[0-2][0-9]))$/.test(reviewedAt.trim())
        if (!bookreviewedAt) return res.status(400).send({ status: false, msg: "enter valid date " })


        //rating validation
        // if (rating === undefined || rating.trim().length === 0) return res.status(400).send({ status: false, msg: "date is required" })
        // bookrating =/^[1-5]$/.test(rating.trim())
        // if (!bookrating) return res.status(400).send({ status: false, msg: "enter valid rating" })

        //reviews validation
        if (!isValid(reviews)) { return res.status(400).send({ status: false, msg: "reviews is required and it must be string" }) }

        let bookreviews = /\w*\s*|\w|\D/.test(reviews.trim())
        if (!bookreviews) return res.status(400).send({ status: false, msg: "enter valid review" })



        const data = await reviewModel.create(details)
        bookDetails.reviews = bookDetails.reviews + 1;
        let reviewsData = data
        bookDetails.reviewsData = reviewsData
        let book = bookDetails

        const bookWithReview = await booksModel.findOneAndUpdate({ _id: bookId }, { reviews: bookDetails.reviews, }, { new: true })



        res.status(201).send({ status: true, msg: "books list", data: data })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}

const deleteReview = async function (req, res) {
    try {
        const bookId = req.params.bookId;
        const reviewId = req.params.reviewId;
        if (!bookId || bookId === undefined) return res.status(400).send({ status: false, msg: "bookId is required" })

        var isValidId = mongoose.Types.ObjectId.isValid(bookId)
        if (!isValidId) return res.status(400).send({ status: false, msg: "Enter valid book id" })

        let book = await booksModel.findOne({ _id: bookId, isDeleted: false });
        if (book === null) {
            return res.status(404).send({ status: false, msg: 'No such book found with the given bookId' });
        }

        if (!reviewId || reviewId === undefined) return res.status(400).send({ status: false, msg: "reviewId is required" })

        var isValidId = mongoose.Types.ObjectId.isValid(reviewId)
        if (!isValidId) return res.status(400).send({ status: false, msg: "Enter valid review id" })

        let review = await reviewModel.findOne({ _id: reviewId, bookId: bookId, isDeleted: false });
        if (review === null) {
            return res.status(404).send({ status: false, msg: 'No such review found  with the given input data' });
        }
        await reviewModel.findByIdAndUpdate({ _id: reviewId }, { isDeleted: true }
        );
        if (book.reviews >= 1) {
            book.reviews = book.reviews - 1;
        }
        else {
            book.reviews = book.reviews
        }
        res.status(200).send({ status: true, message: "review is deleted sucessfully" })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}

module.exports = { createReview, deleteReview }